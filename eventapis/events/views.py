from django.contrib.auth import authenticate
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from events.models import User, Category, Event
from events import serializers, perms
from rest_framework import viewsets, generics, parsers, permissions
from oauth2_provider.models import AccessToken, Application
from oauth2_provider.settings import oauth2_settings
from datetime import datetime
from django.utils import timezone
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
from oauth2_provider.models import AccessToken, Application, RefreshToken
from events.serializers import UserSerializer
import secrets
from django.db.models import Q


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView):
    """
    ViewSet cho người dùng: đăng ký, cập nhật, đăng nhập, đăng xuất, lấy thông tin hiện tại,
    yêu cầu trở thành nhà tổ chức, và xác thực nhà tổ chức.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['login', 'register']:  # Đăng ký và đăng nhập
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    # API Đăng ký
    @action(methods=['post'], detail=False, url_path='register', permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Đăng ký người dùng mới và trả về DRF Token.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Tạo DRF Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'user': serializer.data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

    # API Đăng nhập
    @action(methods=['post'], detail=False, url_path='login', permission_classes=[permissions.AllowAny()])
    def login(self, request):
        """
        Đăng nhập người dùng và trả về DRF Token và OAuth2 access token.
        """
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if not user:
            return Response({'error': 'Thông tin đăng nhập không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Tạo hoặc lấy DRF Token
        token, _ = Token.objects.get_or_create(user=user)

        # Tạo hoặc lấy ứng dụng OAuth2
        app, _ = Application.objects.get_or_create(
            user=user,
            client_type=Application.CLIENT_CONFIDENTIAL,
            authorization_grant_type=Application.GRANT_PASSWORD,
            defaults={'name': f'{user.username}_app'}
        )

        # Tạo token an toàn cho AccessToken
        access_token_value = secrets.token_urlsafe(32)  # Tạo token 32 byte an toàn
        access_token = AccessToken.objects.create(
            user=user,
            application=app,
            expires=timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS),
            token=access_token_value,  # Sử dụng token đã tạo
            scope='read write'
        )
        # Tạo token an toàn cho RefreshToken
        refresh_token_value = secrets.token_urlsafe(32)  # Tạo token 32 byte an toàn
        refresh_token = RefreshToken.objects.create(
            user=user,
            application=app,
            token=refresh_token_value,  # Sử dụng token đã tạo
            access_token=access_token
        )

        return Response({
            'drf_token': token.key,
            'oauth2': {
                'access_token': access_token.token,
                'refresh_token': refresh_token.token,
                'expires_in': oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
            },
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    # API Đăng xuất
    @action(methods=['post'], detail=False, url_path='logout')
    def logout(self, request):
        """
        Đăng xuất: xóa DRF Token và OAuth2 Access Token.
        """
        # Xóa DRF Token
        Token.objects.filter(user=request.user).delete()

        # Xóa OAuth2 Access Token
        if hasattr(request.auth, 'token'):  # Kiểm tra nếu dùng OAuth2
            AccessToken.objects.filter(user=request.user, token=request.auth.token).delete()
        elif hasattr(request.auth, 'key'):  # Kiểm tra nếu dùng DRF Token
            AccessToken.objects.filter(user=request.user).delete()

        return Response({'message': 'Đăng xuất thành công'}, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='request-organizer', detail=True,
            permission_classes=[permissions.IsAuthenticated])
    def request_organizer(self, request, pk=None):
        """
        Người dùng yêu cầu trở thành nhà tổ chức.
        """
        user = self.get_object()
        if user.is_organizer:
            return Response({"detail": "Bạn đã là nhà tổ chức."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_organizer = True
        user.save()
        return Response({"detail": "Yêu cầu đã được gửi. Vui lòng chờ admin xác thực."})


class OrganizerViewSet(viewsets.ViewSet):
    """
    ViewSet cho các hành động liên quan đến nhà tổ chức, như xác thực.
    """
    queryset = User.objects.filter(is_active=True, is_organizer=True)
    serializer_class = serializers.UserSerializer

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


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    """
    ViewSet cho danh mục sự kiện.
    """
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer
    permission_classes = [perms.IsAdminOrReadOnly]


class EventViewSet(viewsets.ViewSet):
    """
    ViewSet cho sự kiện: tạo, liệt kê, cập nhật, xóa.
    Chỉ nhà tổ chức đã xác thực hoặc admin có thể tạo.
    """
    queryset = Event.objects.all()
    serializer_class = serializers.EventSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [perms.IsVerifiedOrganizer | perms.IsAdminOrReadOnly]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [perms.OwnerPerms()]
        return super().get_permissions()

    def get_queryset(self):
        """
        - Admin: thấy tất cả sự kiện.
        - Nhà tổ chức: thấy sự kiện của mình.
        - Người dùng chưa xác thực: thấy tất cả sự kiện công khai
        """
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Event.objects.all()
            return Event.objects.filter(organizer=self.request.user)
        return Event.objects.filter(status='approved')

    @action(detail=True, methods=['post'], url_path='approve_event', permission_classes=[perms.IsAdminOrReadOnly])
    def approve_event(self, request, pk=None):
        """
        Admin duyệt sự kiện.
        """
        event = self.get_object()
        if event.status == 'approved':
            return Response({"detail": "Sự kiện đã được duyệt."}, status=status.HTTP_400_BAD_REQUEST)
        event.status = 'approved'
        event.save()
        return Response({"detail": "Sự kiện đã được duyệt."})

    @action(detail=True, methods=['post'], url_path='reject_event', permission_classes=[perms.IsAdminOrReadOnly])
    def reject_event(self, request, pk=None):
        """
        Admin từ chối sự kiện.
        """
        event = self.get_object()
        if event.status == 'rejected':
            return Response({"detail": "Sự kiện đã bị từ chối."}, status=status.HTTP_400_BAD_REQUEST)
        event.status = 'rejected'
        event.save()
        return Response({"detail": "Sự kiện đã bị từ chối."})

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[permissions.AllowAny])
    def search(self, request):
        """
        Tìm kiếm sự kiện theo:
        - keyword (tên / mô tả),
        - category (id),
        - location,
        - start_date (ngày bắt đầu tìm kiếm),
        - end_date (ngày kết thúc tìm kiếm)
        """
        keyword = request.query_params.get('keyword')
        category_id = request.query_params.get('category')
        location = request.query_params.get('location')
        start_date = request.query_params.get('start_date')  # YYYY-MM-DD
        end_date = request.query_params.get('end_date')  # YYYY-MM-DD

        # Chỉ tìm kiếm sự kiện đã được duyệt
        events = Event.objects.filter(status='approved')

        if keyword:
            events = events.filter(
                Q(name__icontains=keyword) |
                Q(description__icontains=keyword)
            )
        if category_id:
            events = events.filter(category_id=category_id)
        if location:
            events = events.filter(location__icontains=location)

        if start_date:
            try:
                start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                events = events.filter(end_time__gte=start_dt)
            except ValueError:
                return Response({'error': 'start_date không đúng định dạng YYYY-MM-DD'}, status=400)

        if end_date:
            try:
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                events = events.filter(start_time__lte=end_dt)
            except ValueError:
                return Response({'error': 'end_date không đúng định dạng YYYY-MM-DD'}, status=400)

        serializer = self.serializer_class(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
