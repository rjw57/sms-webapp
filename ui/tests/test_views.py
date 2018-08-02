"""
Tests for views.

"""
from unittest import mock

from django.urls import reverse

import smsjwplatform.jwplatform as api
from api.tests.test_views import ViewTestCase, DELIVERY_VIDEO_FIXTURE


class ViewsTestCase(ViewTestCase):
    def setUp(self):
        super().setUp()
        dv_patch = mock.patch('smsjwplatform.jwplatform.DeliveryVideo.from_key')
        self.mock_from_id = dv_patch.start()
        self.mock_from_id.return_value = api.DeliveryVideo(DELIVERY_VIDEO_FIXTURE)
        self.addCleanup(dv_patch.stop)

    def test_success(self):
        """checks that a media item is rendered successfully"""
        item = self.non_deleted_media.get(id='populated')

        # test
        r = self.client.get(reverse('ui:media_item', kwargs={'pk': item.pk}))

        self.assertEqual(r.status_code, 200)
        self.assertTemplateUsed(r, 'ui/media.html')
        media_item_json = r.context['json_ld']
        self.assertEqual(media_item_json['name'], item.title)
        self.assertIn(
            'https://cdn.jwplayer.com/thumbs/{}-1280.jpg'.format(item.jwp.key),
            media_item_json['thumbnailUrl'],
        )

    def test_video_not_found(self):
        """checks that a video not found results in a 404"""
        self.mock_from_id.side_effect = api.VideoNotFoundError

        # test
        r = self.client.get(reverse('ui:media_item', kwargs={'pk': 'this-does-not-exist'}))

        self.assertEqual(r.status_code, 404)

    def test_json_ld_embedded(self):
        """check that a JSON-LD script tag is present in the output"""
        item = self.non_deleted_media.get(id='populated')
        r = self.client.get(reverse('ui:media_item', kwargs={'pk': item.pk}))

        self.assertEqual(r.status_code, 200)
        self.assertTemplateUsed(r, 'ui/media.html')
        content = r.content.decode('utf8')
        self.assertIn('<script type="application/ld+json">', content)

    def test_no_html_in_page(self):
        """checks that HTML in descriptions, etc is escaped."""
        self.mock_from_id.return_value = api.DeliveryVideo(DELIVERY_VIDEO_FIXTURE)
        item = self.non_deleted_media.get(id='populated')

        item.title = '<some-tag>'
        item.save()

        r = self.client.get(reverse('ui:media_item', kwargs={'pk': item.pk}))

        self.assertEqual(r.status_code, 200)
        self.assertTemplateUsed(r, 'ui/media.html')
        content = r.content.decode('utf8')
        self.assertNotIn('<some-tag>', content)
