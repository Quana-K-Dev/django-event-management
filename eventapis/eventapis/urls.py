
from django.contrib import admin
from django.urls import path, include, re_path
from events.admin import admin_site

urlpatterns = [
    path('', include('events.urls')),
    path('admin/', admin_site.urls),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
]
