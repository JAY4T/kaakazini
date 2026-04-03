from django.urls import re_path
from .consumers import CraftsmanStatusConsumer

websocket_urlpatterns = [
    re_path(
        r'ws/craftsman/(?P<craftsman_id>\d+)/status/$',
        CraftsmanStatusConsumer.as_asgi()
    ),
]