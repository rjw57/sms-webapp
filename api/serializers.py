import logging
from urllib import parse as urlparse

from django.conf import settings
from django.urls import reverse
from django.utils.http import urlencode
from rest_framework import serializers

from smsjwplatform import jwplatform
from mediaplatform import models as mpmodels
from mediaplatform_jwp import management

LOG = logging.getLogger(__name__)


# Model serialisers
#
# The following serialisers are to be used for list views and include minimial (if any) related
# resources.


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


class MediaItemRelatedChannelIdField(serializers.PrimaryKeyRelatedField):
    """
    Related field serialiser for media items which asserts that the channel field can only be set
    to a channel which the current user has edit permissions on. If there is no user, the empty
    queryset is returned.
    """
    def get_queryset(self):
        if self.context is None or 'request' not in self.context:
            return mpmodels.Channel.objects.all().none()

        user = self.context['request'].user

        return mpmodels.Channel.objects.all().editable_by_user(user)


class MediaItemSerializer(serializers.HyperlinkedModelSerializer):
    """
    An individual media item.

    """
    class Meta:
        model = mpmodels.MediaItem
        fields = (
            'url', 'id', 'title', 'description', 'duration', 'type', 'publishedAt',
            'downloadable', 'language', 'copyright', 'tags', 'createdAt',
            'updatedAt', 'posterImageUrl', 'channelId',
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

    channelId = MediaItemRelatedChannelIdField(
        source='channel', required=True, help_text='Unique id of owning channel resource',
        write_only=True)

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

    def update(self, instance, validated_data):
        """
        Override behaviour when updating a media item to stop the user changing the channel of an
        existing item.
        """
        # Note: channelId will already have been mapped into a channel object.
        if 'channel' in validated_data:
            raise serializers.ValidationError({
                'channelId': 'This field cannot be changed',
            })

        return super().update(instance, validated_data)

    def get_posterImageUrl(self, obj):
        if not hasattr(obj, 'jwp'):
            return None
        return jwplatform.Video({'key': obj.jwp.key}).get_poster_url(width=640)


# Detail serialisers
#
# The following serialiser are to be used in individual resource views and include more information
# on related resources.


class ProfileSerializer(serializers.Serializer):
    """
    The profile of the current user.

    """
    is_anonymous = serializers.BooleanField(source='user.is_anonymous')
    username = serializers.CharField(source='user.username')
    urls = serializers.DictField()


class SourceSerializer(serializers.Serializer):
    """
    A download source for a particular media type.

    """
    mimeType = serializers.CharField(source='type', help_text="The resource's MIME type")
    url = serializers.URLField(source='file', help_text="The resource's URL")
    width = serializers.IntegerField(help_text='The video width', required=False)
    height = serializers.IntegerField(help_text='The video height', required=False)


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


class MediaItemLinksSerializer(serializers.Serializer):
    legacyStatisticsUrl = serializers.SerializerMethodField()
    embedUrl = serializers.SerializerMethodField()

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


class MediaItemDetailSerializer(MediaItemSerializer):
    """
    An individual media item including related resources.

    """
    class Meta(MediaItemSerializer.Meta):
        fields = MediaItemSerializer.Meta.fields + ('links', 'channel', 'sources')

    links = MediaItemLinksSerializer(source='*', read_only=True)

    channel = ChannelSerializer(read_only=True)

    sources = serializers.SerializerMethodField(source='*')

    def get_sources(self, obj):
        if not obj.downloadable or not hasattr(obj, 'jwp'):
            return []

        video = jwplatform.DeliveryVideo.from_key(obj.jwp.key)

        return SourceSerializer(video.get('sources'), many=True).data


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


class ChannelDetailSerializer(ChannelSerializer):
    """
    An individual channel including related resources.

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
