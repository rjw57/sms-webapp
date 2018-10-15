"""mediawebapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import path, include, re_path
from django.views.generic.base import RedirectView

import automationcommon.views

from ui.sitemaps import sitemaps

# Django debug toolbar is only installed in developer builds
try:
    import debug_toolbar
    HAVE_DDT = True
except ImportError:
    HAVE_DDT = False

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('ucamwebauth.urls')),
    path('healthz', automationcommon.views.status, name='status'),
    path('legacy/', include('legacysms.urls', namespace='legacysms')),
    path('', include('ui.urls', namespace='ui')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),
    path('robots.txt', include('robots.urls')),

    # For multiple versions of the API, the ordering here is important. The *bottom most* entry
    # will become whatever reverse('api:....') returns.
    # See: https://docs.djangoproject.com/en/2.1/topics/http/urls/#topics-http-reversing-url-namespaces  # noqa: E501
    path('api/v1alpha1/', include('api.urls', namespace='v1alpha1')),

    # Redirect swagger schema endpoint to default namespace.
    re_path(
        '^api/swagger(?P<format>\.json|\.yaml)$',
        RedirectView.as_view(pattern_name='v1alpha1:schema')),
]

# Selectively enable django debug toolbar URLs. Only if the toolbar is
# installed *and* DEBUG is True.
if HAVE_DDT and settings.DEBUG:
    urlpatterns = [
        path(r'__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
