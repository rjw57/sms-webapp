"""
Default URL patterns for the :py:mod:`ui` application are provided by the :py:mod:`.urls` module.
You can use the default mapping by adding the following to your global ``urlpatterns``:

.. code::

    from django.urls import path, include

    urlpatterns = [
        # ...
        path('', include('ui.urls')),
        # ...
    ]

"""
from django.urls import path
from django.views.generic import TemplateView

from . import views

app_name = 'ui'

urlpatterns = [
    path('media/<media_key>', views.MediaView.as_view(), name='media_item'),
    path('', TemplateView.as_view(template_name="index.html"), name='home'),
]