from rest_framework import serializers
from events.models import User, Category, Event, Ticket, Payment, ReviewReply, Review
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer cho model User.
    Xử lý tạo và cập nhật mật khẩu đúng cách, và hiển thị link avatar nếu có.
    """

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'is_organizer', 'is_verified', "is_superuser"]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_verified': {'read_only': True}  # Chỉ admin có thể sửa is_verified
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        d = super().to_representation(instance)
        d['avatar'] = instance.avatar.url if instance.avatar else ''
        return d


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    image = serializers.ImageField(required=False, allow_null=True)
    video = serializers.FileField(required=False, allow_null=True)
    start_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M")
    end_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M")

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'category', 'category_id', 'name', 'description',
            'start_time', 'end_time', 'location', 'ticket_price_regular', 'ticket_price_vip',
            'image', 'video', 'status', 'created_date', 'updated_date'
        ]
        extra_kwargs = {
            'status': {'read_only': True},
            'created_date': {'read_only': True},
            'updated_date': {'read_only': True}
        }

    def validate(self, data):
        """
        Kiểm tra:
        - start_time phải ở tương lai
        - end_time phải sau start_time
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time and start_time <= timezone.now():
            raise serializers.ValidationError({"start_time": "Thời gian bắt đầu phải ở tương lai."})

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": "Thời gian kết thúc phải sau thời gian bắt đầu."})

        return data

    def create(self, validated_data):
        """
        Tự động gán organizer là user hiện tại.
        """
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        """
        Hiển thị URL cho image và video nếu có.
        """
        d = super().to_representation(instance)
        d['image'] = instance.image.url if instance.image else ''
        d['video'] = instance.video.url if instance.video else ''
        d['created_date'] = instance.created_date.isoformat()  # Định dạng ISO 8601
        return d


class TicketSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(), source='event')
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'event_id', 'ticket_type', 'quantity', 'total_price', 'qr_code', 'created_date', 'status']
        extra_kwargs = {
            'qr_code': {'read_only': True},
            'created_date': {'read_only': True},
            'status': {'read_only': True}
        }

    def get_total_price(self, obj):
        if obj.ticket_type == 'regular':
            return obj.quantity * obj.event.ticket_price_regular
        return obj.quantity * obj.event.ticket_price_vip

    def validate(self, data):
        event = data.get('event')
        ticket_type = data.get('ticket_type')
        quantity = data.get('quantity', 1)

        if ticket_type not in ['regular', 'vip']:
            raise serializers.ValidationError({"ticket_type": "Loại vé không hợp lệ."})
        if ticket_type == 'vip' and not event.ticket_price_vip:
            raise serializers.ValidationError({"ticket_type": "Sự kiện không có vé VIP."})
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Số lượng vé phải lớn hơn 0."})
        return data


class TicketDetailSerializer(serializers.ModelSerializer):
    event = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'event', 'ticket_type', 'quantity', 'total_price', 'status', 'created_date', 'qr_code']

    def get_event(self, obj):
        if obj.event:
            return {
                'id': obj.event.id,
                'name': obj.event.name,
                'location': obj.event.location,
                'start_time': obj.event.start_time,
                'end_time': obj.event.end_time,
            }
        return None

    def get_total_price(self, obj):
        if obj.ticket_type == 'vip':
            return obj.quantity * obj.event.ticket_price_vip
        return obj.quantity * obj.event.ticket_price_regular

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'ticket_id', 'method', 'amount', 'status', 'payment_url', 'created_date']
        extra_kwargs = {
            'amount': {'read_only': True},
            'status': {'read_only': True},
            'payment_url': {'read_only': True},
            'created_date': {'read_only': True}
        }

    def validate(self, data):
        method = data.get('method')
        if method not in ['vnpay', 'momo', 'zalopay', 'credit_card']:
            raise serializers.ValidationError({"method": "Phương thức thanh toán không hợp lệ."})
        return data


class ReviewReplySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = ReviewReply
        fields = ['id', 'user', 'content', 'created_date']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'is_organizer': obj.user.is_organizer
        }


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    created_date = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S%z", read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'event', 'user', 'rating', 'comment', 'created_date', 'replies']
        extra_kwargs = {
            'event': {'read_only': True}
        }

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username
        }

    # def validate_rating(self, value):
    #     if value < 1 or value > 5:
    #         raise serializers.ValidationError(("Đánh giá phải trong khoảng từ 1 đến 5 sao."))
    #     return value

    def validate_comment(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError(("Bình luận không được vượt quá 1000 ký tự."))
        if value and not value.strip():
            raise serializers.ValidationError(("Bình luận không được để trống."))
        return value

    def validate(self, data):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            raise serializers.ValidationError(("Yêu cầu không hợp lệ hoặc người dùng chưa đăng nhập."))

        # For updates, use the event from the existing review instance
        if self.instance:
            event = self.instance.event
        else:
            event = self.context.get('event')
            if not event:
                raise serializers.ValidationError(("Sự kiện không được tìm thấy."))

        # Only apply creation-specific validations for new reviews
        if not self.instance:
            # Kiểm tra vé hợp lệ
            if not event.ticket_set.filter(
                    user=request.user,
                    status='booked',
                    expires_at__gt=timezone.now()
            ).exists():
                raise serializers.ValidationError(
                    ("Bạn cần tham gia sự kiện với vé còn hiệu lực để đánh giá.")
                )

            # Kiểm tra sự kiện đã kết thúc (bao gồm 24 giờ ân hạn)
            if event.end_time and not timezone.is_aware(event.end_time):
                event.end_time = timezone.make_aware(event.end_time)
            if event.end_time > timezone.now() - timezone.timedelta(hours=24):
                raise serializers.ValidationError(
                    ("Chỉ có thể đánh giá sự kiện sau khi kết thúc (hoặc trong vòng 24 giờ sau).")
                )

            # Kiểm tra đánh giá trùng lặp
            if Review.objects.filter(event=event, user=request.user).exists():
                raise serializers.ValidationError(("Bạn đã đánh giá sự kiện này trước đó."))

        return data
