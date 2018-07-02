"""
Views

"""
import json

from rest_framework.renderers import TemplateHTMLRenderer

import api.views as apiviews


class MediaView(apiviews.MediaView):
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'ui/media.html'

    def get(self, request, media_key):
        response = super().get(request, media_key)
        response.data['json'] = json.dumps(response.data)
        return response
