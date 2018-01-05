"""
Views provided by :py:mod:`smsjwplatform`.

"""
from django.conf import settings
from django.http import Http404
from django.shortcuts import render

from . import jwplatform as api


def embed(request, media_id):
    """
    :param request: the current request
    :param media_id: SMS media id of the required media
    :type media_id: int

    Render an embedded video/audio player based on the SMS media ID. If the ``format`` GET
    parameter is provided, it should be one of ``audio`` or ``video`` and this is used to specify
    the preferred media type.

    If no media matching the provided SMS media ID is found, a 404 response is generated.

    If the :py:data:`~.defaultsettings.JWPLATFORM_EMBED_PLAYER_KEY` setting is blank, a
    response is generated.

    In :py:mod:`~.urls` this view is named ``smsjwplatform:embed``.

    """
    # We cannot serve any media without a player
    if settings.JWPLATFORM_EMBED_PLAYER_KEY == '':
        raise Http404('No player found')

    try:
        key = api.key_for_media_id(
            media_id, preferred_media_type=request.GET.get('format', 'video'))
    except api.VideoNotFoundError:
        raise Http404('Media item does not exist')

    url = api.player_embed_url(key, settings.JWPLATFORM_EMBED_PLAYER_KEY, 'js')
    return render(request, 'smsjwplatform/embed.html', {
        'embed_url': url,
    })
