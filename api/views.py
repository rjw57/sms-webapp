import logging

from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import APIView

from smsjwplatform import jwplatform

from . import serializers


LOG = logging.getLogger(__name__)


class JWPAPIException(APIException):
    status_code = 502  # Bad Gateway
    default_detail = 'Bad Gateway'
    default_code = 'jwplatform_api_error'


def check_api_call(response):
    if response.get('status') == 'ok':
        return response

    LOG.error('API call error: %r', response)
    raise JWPAPIException()


class ProfileView(APIView):
    def get(self, request):
        urls = {'login': settings.LOGIN_URL}
        return Response(serializers.ProfileSerializer({
            'user': request.user, 'urls': urls,
        }).data)


class CollectionListView(APIView):
    """

    """
    @swagger_auto_schema(
        query_serializer=serializers.CollectionListQuerySerializer(),
        responses={200: serializers.CollectionSerializer()}
    )
    def get(self, request):
        """

        """
        client = jwplatform.get_jwplatform_client()

        query_serializer = serializers.MediaListQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)

        params = {}

        # Add default parameters
        params.update({
            'result_limit': 100,
        })

        # Add parameters from query
        params.update(query_serializer.data)

        # Add parameters which cannot be overridden
        params.update({
            'http_method': 'POST',
        })

        channel_list = check_api_call(jwplatform.Channel.list(params, client=client))

        # TODO: filter channels by ACL

        return Response(serializers.CollectionListSerializer(channel_list).data)


class MediaListView(APIView):
    """

    """
    @swagger_auto_schema(
        query_serializer=serializers.MediaListQuerySerializer(),
        responses={200: serializers.MediaListSerializer()}
    )
    def get(self, request):
        client = jwplatform.get_jwplatform_client()

        query_serializer = serializers.MediaListQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)

        params = {}

        # Add default parameters
        params.update({
            'order_by': 'date:desc',
            'result_limit': 100,
        })

        # Add parameters from query
        params.update(query_serializer.data)

        # Add parameters which cannot be overridden
        params.update({
            'statuses_filter': 'ready',
            'http_method': 'POST',
        })

        video_list = check_api_call(jwplatform.Video.list(params, client=client))

        # Filter videos by ACL
        video_list['videos'] = [
            video for video in video_list['videos']
            if user_can_view_resource(request.user, video)
        ]

        return Response(serializers.MediaListSerializer(video_list).data)


def user_can_view_resource(user, resource):
    try:
        resource.check_user_access(user)
        return True
    except jwplatform.ResourceACLPermissionDenied:
        return False
