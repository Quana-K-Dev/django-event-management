from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import UserViewSet, CategoryViewSet, EventViewSet, OrganizerViewSet, PaymentViewSet, TicketViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'events', EventViewSet, basename='event')
router.register(r'organizers', OrganizerViewSet, basename='organizer')
router.register(r'tickets', PaymentViewSet, basename='payment')  # Endpoint cho thanh toán
router.register(r'events/(?P<event_id>\d+)/tickets', TicketViewSet, basename='ticket')  # Endpoint cho đặt vé

urlpatterns = [
    path('', include(router.urls)),
]