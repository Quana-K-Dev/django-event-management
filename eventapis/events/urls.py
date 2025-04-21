from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

# router.register('categories', views.CategoryViewSet, basename='category')
# router.register('events', views.EventViewSet, basename='event')
# router.register('tickets', views.TicketViewSet, basename='ticket')
# router.register('payments', views.PaymentViewSet, basename='payment')
# router.register('likes', views.LikeViewSet, basename='like')
# router.register('interests', views.InterestViewSet, basename='interest')
# router.register('reviews', views.ReviewViewSet, basename='review')
# router.register('notifications', views.NotificationViewSet, basename='notification')
# router.register('users', views.UserViewSet, basename='user')
# router.register('organizer-requests', views.OrganizerRequestViewSet, basename='organizer-request')

urlpatterns = [
    path('', include(router.urls))  # Tự động sinh các đường dẫn từ router
]