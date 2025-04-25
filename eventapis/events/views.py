from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, mixins
from events.models import User, Category, Event, Ticket, Payment
from events import serializers, perms
from rest_framework import viewsets, generics, parsers, permissions
from oauth2_provider.models import AccessToken, Application
from oauth2_provider.settings import oauth2_settings
from datetime import datetime
from django.utils import timezone
import hashlib
import hmac
import urllib.parse
from django.conf import settings

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    """
    ViewSet cho người dùng: đăng ký, cập nhật, đăng nhập, đăng xuất, lấy thông tin hiện tại,
    yêu cầu trở thành nhà tổ chức, và xác thực nhà tổ chức.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        """
        Gán quyền tùy theo method:
        - PUT/PATCH: chỉ cho chủ sở hữu sửa
        - Còn lại: cho phép tất cả (ví dụ: đăng ký, đăng nhập)
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [perms.OwnerPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        """
        Trả về thông tin người dùng hiện tại nếu đã đăng nhập.
        """
        return Response(serializers.UserSerializer(request.user).data)

    @action(methods=['post'], url_path='login', detail=False, permission_classes=[permissions.AllowAny])
    def login_user(self, request):
        """
        Đăng nhập người dùng với username và password.
        Trả về OAuth2 access token và thông tin người dùng.
        """
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            # Tạo hoặc lấy ứng dụng OAuth2
            app, _ = Application.objects.get_or_create(
                user=user,
                client_type=Application.CLIENT_CONFIDENTIAL,
                authorization_grant_type=Application.GRANT_PASSWORD,
                defaults={'name': f'{user.username}_app'}
            )
            # Tạo access token
            token = AccessToken.objects.create(
                user=user,
                application=app,
                expires=timezone.now() + oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                token=AccessToken.objects.generate_token(),
                scope='read write'
            )
            return Response({
                'access_token': token.token,
                'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
                'user': serializers.UserSerializer(user).data
            })
        return Response({'error': 'Thông tin đăng nhập không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['post'], url_path='logout', detail=False, permission_classes=[permissions.IsAuthenticated])
    def logout_user(self, request):
        """
        Đăng xuất: xóa OAuth2 access token của người dùng.
        """
        AccessToken.objects.filter(user=request.user, token=request.auth).delete()
        return Response({'message': 'Đăng xuất thành công'}, status=status.HTTP_200_OK)


class OrganizerViewSet(viewsets.GenericViewSet):
    """
    ViewSet cho các hành động liên quan đến nhà tổ chức, như xác thực.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer

    @action(methods=['post'], url_path='request-organizer', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def request_organizer(self, request):
        """
        Người dùng yêu cầu trở thành nhà tổ chức.
        """
        user = request.user
        if user.is_organizer:
            return Response({"detail": "Bạn đã là nhà tổ chức."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_organizer = True
        user.save()
        serializer = self.get_serializer(user)
        return Response({
            "detail": "Yêu cầu đã được gửi. Vui lòng chờ admin xác thực.",
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='verify', detail=True, permission_classes=[perms.IsAdminOrReadOnly])
    def verify_organizer(self, request, pk=None):
        """
        Admin xác thực cho nhà tổ chức.
        """
        user = self.get_object()
        if not user.is_organizer:
            return Response({"detail": "Người dùng không phải nhà tổ chức."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_verified:
            return Response({"detail": "Nhà tổ chức đã được xác thực."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_verified = True
        user.save()
        return Response({"detail": "Nhà tổ chức đã được xác thực."})

class CategoryViewSet(viewsets.ViewSet):
    """
    ViewSet cho danh mục sự kiện.
    """
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [perms.IsAdminOrReadOnly]

class EventViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.all()
    serializer_class = serializers.EventSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [perms.IsVerifiedOrganizer | perms.IsAdminOrReadOnly]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [perms.OwnerPerms()]
        return super().get_permissions()

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Event.objects.all()
            return Event.objects.filter(organizer=self.request.user)
        return Event.objects.filter(status='approved')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], url_path='approve_event', permission_classes=[perms.IsAdminOrReadOnly])
    def approve_event(self, request, pk=None):
        event = self.get_object()
        if event.status == 'approved':
            return Response({"detail": "Sự kiện đã được duyệt."}, status=status.HTTP_400_BAD_REQUEST)
        event.status = 'approved'
        event.save()
        return Response({"detail": "Sự kiện đã được duyệt."})

    @action(detail=True, methods=['post'], url_path='reject_event', permission_classes=[perms.IsAdminOrReadOnly])
    def reject_event(self, request, pk=None):
        event = self.get_object()
        if event.status == 'rejected':
            return Response({"detail": "Sự kiện đã bị từ chối."}, status=status.HTTP_400_BAD_REQUEST)
        event.status = 'rejected'
        event.save()
        return Response({"detail": "Sự kiện đã bị từ chối."})

# Cấu hình VNPay (thêm vào settings.py sau)
VNPAY_TMN_CODE = 'YOUR_VNPAY_TMN_CODE'
VNPAY_HASH_SECRET_KEY = 'YOUR_VNPAY_HASH_SECRET_KEY'
VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
VNPAY_RETURN_URL = 'http://localhost:8000/tickets/payment/return/'

class TicketViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    queryset = Ticket.objects.all()
    serializer_class = serializers.TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        API Đặt vé: /events/{event_id}/tickets/
        """
        event_id = self.kwargs.get('event_id')
        try:
            event = Event.objects.get(id=event_id, status='approved')
        except Event.DoesNotExist:
            return Response({"detail": "Sự kiện không tồn tại hoặc chưa được duyệt."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket = serializer.save(
            user=request.user,
            event=event,
            expires_at=timezone.now() + timedelta(minutes=30)
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['post'], url_path='validate', detail=True, permission_classes=[perms.IsVerifiedOrganizer])
    def validate_ticket(self, request, pk=None):
        """
        API Xác nhận mã QR: /tickets/{ticket_id}/validate/
        """
        ticket = self.get_object()
        qr_code = request.data.get('qr_code')

        if ticket.qr_code != qr_code:
            return Response({"status": "invalid", "detail": "Mã QR không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
        if ticket.status != 'booked':
            return Response({"status": "invalid", "detail": "Vé không ở trạng thái hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)
        if ticket.expires_at < timezone.now():
            return Response({"status": "invalid", "detail": "Vé đã hết hạn."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "ticket_id": ticket.id,
            "event_id": ticket.event.id,
            "participant_id": ticket.user.id,
            "status": "valid"
        }, status=status.HTTP_200_OK)

class PaymentViewSet(viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        API Thanh toán: /tickets/{ticket_id}/payment/
        """
        ticket_id = self.kwargs.get('ticket_id')
        try:
            ticket = Ticket.objects.get(id=ticket_id, user=request.user, status='pending')
        except Ticket.DoesNotExist:
            return Response({"detail": "Vé không tồn tại hoặc không thuộc về bạn."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Tính tổng tiền
        total_price = ticket.quantity * (ticket.event.ticket_price_regular if ticket.ticket_type == 'regular' else ticket.event.ticket_price_vip)

        # Tạo Payment
        payment = serializer.save(
            ticket=ticket,
            amount=total_price,
            status='pending'
        )

        # Tạo URL thanh toán cho VNPay
        if payment.method == 'vnpay':
            payment_url = self.create_vnpay_payment_url(payment, request)
            payment.payment_url = payment_url
            payment.save()
        else:
            # Xử lý các cổng thanh toán khác (Momo, ZaloPay, Credit Card)
            payment_url = self.handle_other_payment_gateways(payment.method, payment)

        return Response({
            "payment_url": payment.payment_url,
            "ticket_id": ticket.id,
            "status": payment.status
        }, status=status.HTTP_200_OK)

    def create_vnpay_payment_url(self, payment, request):
        """
        Tạo URL thanh toán VNPay
        """
        params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': VNPAY_TMN_CODE,
            'vnp_Amount': int(payment.amount * 100),  # VNPay yêu cầu số tiền * 100
            'vnp_CreateDate': timezone.now().strftime('%Y%m%d%H%M%S'),
            'vnp_CurrCode': 'VND',
            'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),
            'vnp_Locale': 'vn',
            'vnp_OrderInfo': f'Thanhtoan ve {payment.ticket.id}',
            'vnp_OrderType': 'billpayment',
            'vnp_ReturnUrl': VNPAY_RETURN_URL,
            'vnp_TxnRef': f'TICKET{payment.ticket.id}_{int(timezone.now().timestamp())}'
        }

        # Sắp xếp params theo key
        sorted_params = sorted(params.items())
        query_string = urllib.parse.urlencode(sorted_params)
        hash_data = query_string.encode('utf-8')
        secure_hash = hmac.new(
            VNPAY_HASH_SECRET_KEY.encode('utf-8'),
            hash_data,
            hashlib.sha512
        ).hexdigest()
        params['vnp_SecureHash'] = secure_hash

        return f"{VNPAY_URL}?{query_string}&vnp_SecureHash={secure_hash}"

    def handle_other_payment_gateways(self, method, payment):
        """
        Xử lý các cổng thanh toán khác (Momo, ZaloPay, Credit Card)
        """
        # TODO: Tích hợp Momo, ZaloPay, Credit Card
        return f"https://example.com/{method}/payment/{payment.id}"

    @action(methods=['get'], url_path='return', detail=False, permission_classes=[permissions.AllowAny])
    def payment_return(self, request):
        """
        Xử lý callback từ VNPay sau khi thanh toán
        """
        vnpay_response = request.query_params
        vnp_secure_hash = vnpay_response.get('vnp_SecureHash')
        vnp_params = {k: v for k, v in vnpay_response.items() if k != 'vnp_SecureHash'}
        sorted_params = sorted(vnp_params.items())
        query_string = urllib.parse.urlencode(sorted_params)
        hash_data = query_string.encode('utf-8')
        calculated_hash = hmac.new(
            VNPAY_HASH_SECRET_KEY.encode('utf-8'),
            hash_data,
            hashlib.sha512
        ).hexdigest()

        if calculated_hash != vnp_secure_hash:
            return Response({"detail": "Chữ ký không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST)

        ticket_id = vnpay_response.get('vnp_TxnRef').split('_')[0].replace('TICKET', '')
        try:
            payment = Payment.objects.get(ticket_id=ticket_id)
        except Payment.DoesNotExist:
            return Response({"detail": "Thanh toán không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        if vnpay_response.get('vnp_ResponseCode') == '00':
            payment.status = 'completed'
            payment.ticket.status = 'booked'
            payment.ticket.save()
            payment.save()
            return Response({"detail": "Thanh toán thành công."}, status=status.HTTP_200_OK)
        else:
            payment.status = 'failed'
            payment.save()
            return Response({"detail": "Thanh toán thất bại."}, status=status.HTTP_400_BAD_REQUEST)

