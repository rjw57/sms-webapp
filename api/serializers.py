import logging

from rest_framework import serializers


LOG = logging.getLogger(__name__)


class MediaSerializer(serializers.Serializer):
    id = serializers.CharField(source='key')
    title = serializers.CharField()
    description = serializers.CharField()
    published_at_timestamp = serializers.IntegerField(source='date')
    poster_image_url = serializers.SerializerMethodField()
    duration = serializers.FloatField()
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return 'https://sms.cam.ac.uk/media/{.media_id}'.format(obj)

    def get_poster_image_url(self, obj):
        return obj.get_poster_url()


class MediaListSerializer(serializers.Serializer):
    """
    Serialise a JWPlatform video list response.

    """
    results = MediaSerializer(many=True, source='videos')
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()
    total = serializers.IntegerField()


class MediaListQuerySerializer(serializers.Serializer):
    search = serializers.CharField(
        required=False,
        help_text='Free text search for media item'
    )


class CollectionSerializer(serializers.Serializer):
    id = serializers.CharField(source='key')
    title = serializers.CharField()
    description = serializers.CharField()
    poster_image_url = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        return 'https://sms.cam.ac.uk/collection/{.collection_id}'.format(obj)

    def get_poster_image_url(self, obj):
        return obj.get_poster_url()


class CollectionListSerializer(serializers.Serializer):
    """
    Serialise a JWPlatform video list response.

    """
    results = CollectionSerializer(many=True, source='channels')
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()
    total = serializers.IntegerField()


class CollectionListQuerySerializer(serializers.Serializer):
    search = serializers.CharField(
        required=False,
        help_text='Free text search for collection'
    )


class ProfileSerializer(serializers.Serializer):
    is_anonymous = serializers.BooleanField(source='user.is_anonymous')
    username = serializers.CharField(source='user.username')
    urls = serializers.DictField()
