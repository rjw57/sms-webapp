"""
URL routing schema for API

"""

from django.urls import path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from . import views

app_name = 'api'

schema_view = get_schema_view(
   openapi.Info(
      title='Media API',
      description='Media Service Content API',
      default_version='',  # gets filled in via NamespaceVersioning
      contact=openapi.Contact(email='automation@uis.cam.ac.uk'),
      license=openapi.License(name='MIT License'),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('media/', views.MediaItemListView.as_view(), name='media_list'),
    path('media/<pk>', views.MediaItemView.as_view(), name='media_item'),
    path('media/<pk>/upload', views.MediaItemUploadView.as_view(), name='media_upload'),
    path('media/<pk>/analytics', views.MediaItemAnalyticsView.as_view(),
         name='media_item_analytics'),
    path('media/<pk>/embed', views.MediaItemEmbedView.as_view(), name='media_embed'),
    path('media/<pk>/source', views.MediaItemSourceView.as_view(), name='media_source'),
    # This path is included because itunes doesn't accept an rss feed enclosure url without an
    # extension. Note that MediaItemSourceView will ignore whatever <extension> is set to and it is
    # the callers responsibility to ensure that the source type matches the extension.
    path(
        'media/<pk>/source.<extension>', views.MediaItemSourceView.as_view(),
        name='media_source_with_ext'
    ),
    path('media/<pk>/poster-<int:width>.<extension>',
         views.MediaItemPosterView.as_view(), name='media_poster'),
    path('channels/', views.ChannelListView.as_view(), name='channel_list'),
    path('channels/<pk>', views.ChannelView.as_view(), name='channel'),
    path('playlists/', views.PlaylistListView.as_view(), name='playlist_list'),
    path('playlists/<pk>', views.PlaylistView.as_view(), name='playlist'),
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Swagger API schema endpoint
    re_path(
        r'^swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(cache_timeout=None), name='schema'),
]
