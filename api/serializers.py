import logging
from urllib import parse as urlparse

from django.conf import settings
from django.urls import reverse
from django.utils.http import urlencode
from rest_framework import serializers

from smsjwplatform import jwplatform
from mediaplatform import models as mpmodels
from mediaplatform_jwp import management
from smsjwplatform.jwplatform import VideoNotFoundError

LOG = logging.getLogger(__name__)


class SourceSerializer(serializers.Serializer):
    """
    A download source for a particular media type.

    """
    mimeType = serializers.CharField(source='type', help_text="The resource's MIME type")
    url = serializers.URLField(source='file', help_text="The resource's URL")
    width = serializers.IntegerField(help_text='The video width', required=False)
    height = serializers.IntegerField(help_text='The video height', required=False)


class LegacySMSMediaSerializer(serializers.Serializer):
    id = serializers.IntegerField(help_text='Unique id for an SMS media')
    statisticsUrl = serializers.SerializerMethodField(help_text='Link to statistics page')

    def get_statisticsUrl(self, obj):
        return urlparse.urljoin(
            settings.LEGACY_SMS_FRONTEND_URL, f'media/{obj.id:d}/statistics')


class MediaItemSerializer(serializers.HyperlinkedModelSerializer):
    """
    An individual media item.

    This schema corresponds to Google's recommended layout for a Video object
    (https://developers.google.com/search/docs/data-types/video).

    """
    class Meta:
        model = mpmodels.MediaItem
        fields = (
            'url', 'id', 'title', 'description', 'duration', 'type', 'publishedAt',
            'downloadable', 'language', 'copyright', 'tags', 'createdAt',
            'updatedAt', 'posterImageUrl',
        )

        read_only_fields = (
            'url', 'id', 'duration', 'type', 'createdAt', 'updatedAt', 'posterImageUrl'
        )
        extra_kwargs = {
            'createdAt': {'source': 'created_at'},
            'publishedAt': {'source': 'published_at'},
            'updatedAt': {'source': 'updated_at'},
            'url': {'view_name': 'api:media_item'},
            'title': {'allow_blank': False},
        }

    posterImageUrl = serializers.SerializerMethodField(
        help_text='A URL of a thumbnail/poster image for the media', read_only=True)

    def create(self, validated_data):
        """
        Override behaviour when creating a new object using this serializer. If the current request
        is being passed in the context, give the request user edit and view permissions on the
        item.

        """
        request = None
        if self.context is not None and 'request' in self.context:
            request = self.context['request']

        if request is not None and not request.user.is_anonymous:
            obj = mpmodels.MediaItem.objects.create_for_user(request.user, **validated_data)
        else:
            obj = mpmodels.MediaItem.objects.create(**validated_data)

        return obj

    def get_posterImageUrl(self, obj):
        if not hasattr(obj, 'jwp'):
            return None
        return jwplatform.Video({'key': obj.jwp.key}).get_poster_url(width=640)


class MediaItemLinksSerializer(serializers.Serializer):
    legacyStatisticsUrl = serializers.SerializerMethodField()
    embedUrl = serializers.SerializerMethodField()
    sources = serializers.SerializerMethodField(source='*')

    def get_legacyStatisticsUrl(self, obj):
        if not hasattr(obj, 'sms'):
            return None
        return urlparse.urljoin(
            settings.LEGACY_SMS_FRONTEND_URL, f'media/{obj.sms.id:d}/statistics')

    def get_embedUrl(self, obj):
        if not hasattr(obj, 'jwp'):
            return None
        return jwplatform.player_embed_url(
            obj.jwp.key, settings.JWPLATFORM_EMBED_PLAYER_KEY, 'html',
            settings.JWPLATFORM_CONTENT_BASE_URL
        )

    def get_sources(self, obj):
        if not obj.downloadable or not hasattr(obj, 'jwp'):
            return []

        try:
            video = jwplatform.DeliveryVideo.from_key(obj.jwp.key)
        except VideoNotFoundError as e:
            # this can occur if the video is still transcoding - better to set the sources to none
            # than fail completely
            LOG.warning("unable to generate download sources as the JW video is not yet available")
            return []

        return SourceSerializer(video.get('sources'), many=True).data


class MediaItemDetailSerializer(MediaItemSerializer):
    """
    Serialize a media object with greater detail for an individual media detail response

    """
    class Meta(MediaItemSerializer.Meta):
        fields = MediaItemSerializer.Meta.fields + ('links',)

    links = MediaItemLinksSerializer(source='*', read_only=True)


class ProfileSerializer(serializers.Serializer):
    """
    The profile of the current user.

    """
    is_anonymous = serializers.BooleanField(source='user.is_anonymous')
    username = serializers.CharField(source='user.username')
    urls = serializers.DictField()


class MediaUploadSerializer(serializers.Serializer):
    """
    A serializer which returns an upload endpoint for a media item. Intended to be used as custom
    serializer in an UpdateView for MediaItem models.

    """
    url = serializers.URLField(source='upload_endpoint.url', read_only=True)
    expires_at = serializers.DateTimeField(source='upload_endpoint.expires_at', read_only=True)

    def update(self, instance, verified_data):
        # TODO: abstract the creation of UploadEndpoint objects to be backend neutral
        management.create_upload_endpoint(instance)
        return instance


class MediaAnalyticsItemSerializer(serializers.Serializer):
    """
    The number of viewing for a particular media item on a particular day.

    """
    date = serializers.SerializerMethodField(help_text='The day when a media was viewed')
    views = serializers.SerializerMethodField(help_text='The number of media views on a day')

    def get_date(self, row):
        return str(row[0])

    def get_views(self, row):
        return row[1]


class MediaAnalyticsListSerializer(serializers.Serializer):
    """
    A list of media analytics data points.

    """
    results = MediaAnalyticsItemSerializer(many=True, source='*')


class ChannelSerializer(serializers.HyperlinkedModelSerializer):
    """
    An individual channel.

    """
    class Meta:
        model = mpmodels.MediaItem
        fields = (
            'url', 'id', 'title', 'description', 'createdAt', 'updatedAt',
        )

        read_only_fields = (
            'url', 'id', 'createdAt', 'updatedAt',
        )
        extra_kwargs = {
            'createdAt': {'source': 'created_at'},
            'updatedAt': {'source': 'updated_at'},
            'url': {'view_name': 'api:channel'},
            'title': {'allow_blank': False},
        }

    def create(self, validated_data):
        """
        Override behaviour when creating a new object using this serializer. If the current request
        is being passed in the context, give the request user edit and view permissions on the
        item.

        """
        request = None
        if self.context is not None and 'request' in self.context:
            request = self.context['request']

        if request is not None and not request.user.is_anonymous:
            obj = mpmodels.Channel.objects.create_for_user(request.user, **validated_data)
        else:
            obj = mpmodels.Channel.objects.create(**validated_data)

        return obj


class ChannelDetailSerializer(ChannelSerializer):
    """
    An individual channel including any information which should only appear in the detail view.

    """
    class Meta(ChannelSerializer.Meta):
        fields = ChannelSerializer.Meta.fields + ('mediaUrl',)

    mediaUrl = serializers.SerializerMethodField(
        help_text='URL pointing to list of media items for this channel'
    )

    def get_mediaUrl(self, obj):
        # Get location of media list endpoint
        location = reverse('api:media_list')

        # Add query parameter
        location += '?' + urlencode({'channel': obj.id})

        if self.context is None or 'request' not in self.context:
            return location

        return self.context['request'].build_absolute_uri(location)
