"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def tiktok_verification(request):
    return HttpResponse("tiktok-developers-site-verification=EvW41VLdGJ8rwmy2Z2EoY5tBsBckPlEU", content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('tiktok-developers-site-verification', tiktok_verification),
    path('path/', tiktok_verification),
    # Ruta específica basada en el ejemplo de tu amigo (tiktok + CODIGO + .txt)
    # Ruta específica para verificación de dominio de TikTok (Nueva App)
    path('tiktok5bKFy1LfPc3Xzmg91my2FQb4OLJImvpN.txt', lambda r: HttpResponse("tiktok-developers-site-verification=5bKFy1LfPc3Xzmg91my2FQb4OLJImvpN", content_type="text/plain")),
]

# Servir archivos de media en desarrollo
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
