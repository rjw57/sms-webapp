"""
Views

"""
import logging

from django.templatetags import static
from django.views.generic import RedirectView
from rest_framework import generics
from rest_framework.renderers import TemplateHTMLRenderer

from api import views as apiviews
from . import serializers

LOG = logging.getLogger(__name__)


class MediaView(apiviews.MediaItemMixin, generics.RetrieveAPIView):
    """View for rendering an individual media item. Extends the DRF's media item view."""
    serializer_class = serializers.MediaItemPageSerializer
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'ui/media.html'


class MediaItemAnalyticsView(apiviews.MediaItemMixin, generics.RetrieveAPIView):
    """
    View for rendering an individual media item's analytics.
    Extends the DRF's media item analytics view.

    """
    serializer_class = serializers.MediaItemAnalyticsPageSerializer
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'ui/analytics.html'


class ChannelView(apiviews.ChannelMixin, generics.RetrieveAPIView):
    """View for rendering an individual channel. Extends the DRF's channel view."""
    serializer_class = serializers.ChannelPageSerializer
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'ui/resource.html'


class PlaylistView(apiviews.PlaylistMixin, generics.RetrieveAPIView):
    """View for rendering an individual playlist. Extends the DRF's channel view."""
    serializer_class = serializers.PlaylistPageSerializer
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'ui/resource.html'


class StaticFileView(RedirectView):
    """
    A variant of RedirectView which will redirect to the static file whose path is the *path*
    attribute.

    Example use in ``urls.py``:

    .. code::

        path('/some/file.ext', views.StaticFileView(path='staticfile.ext'), name='file')

    """
    path = None

    def get_redirect_url(self, *args, **kwargs):
        if self.path is not None:
            return static.static(self.path)
        return super().get_redirect_url(*args, **kwargs)
