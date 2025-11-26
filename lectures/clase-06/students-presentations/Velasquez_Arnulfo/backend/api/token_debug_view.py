from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SocialCredential

class TikTokTokenView(APIView):
    """
    Endpoint para ver el token de TikTok guardado (solo para debugging).
    GET /api/tiktok/token/
    """
    def get(self, request):
        try:
            credential = SocialCredential.objects.get(plataforma='tiktok')
            return Response({
                "access_token": credential.access_token,
                "refresh_token": credential.refresh_token,
                "expires_at": credential.expires_at,
                "updated_at": credential.updated_at
            })
        except SocialCredential.DoesNotExist:
            return Response({"error": "No hay token guardado"}, status=404)
