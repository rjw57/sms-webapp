# Generated by Django 2.1.1 on 2018-09-25 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mediaplatform', '0016_add_download_mediaitem_permission'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='mediaitem',
            index=models.Index(fields=['updated_at'], name='mediaplatfo_updated_96b62d_idx'),
        ),
        migrations.AddIndex(
            model_name='mediaitem',
            index=models.Index(fields=['published_at'], name='mediaplatfo_publish_d7db5b_idx'),
        ),
    ]
