from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

# Importamos tus modelos y servicios
from .models import Post, Publication, SocialCredential
from .llm_service import adaptar_contenido_con_gemini
from .social_service import publicar_en_facebook, publicar_en_linkedin, publicar_en_whatsapp, publicar_en_instagram, publicar_en_tiktok, get_tiktok_auth_url, get_tiktok_access_token
from .serializers import PostSerializer
from .notification_service import notify_success, notify_error, notify_manual_action

# --- VISTAS DE ESCRITURA/PUBLICACIÓN (POST) ---

class AdaptarContenidoView(APIView):
    """
    1. Recibe Título y Contenido.
    2. Guarda el Post original en BD.
    3. Llama a Gemini.
    4. Guarda los Borradores (Drafts) en la tabla Publication.
    """
    def post(self, request, *args, **kwargs):
        titulo = request.data.get('titulo')
        contenido = request.data.get('contenido')

        if not titulo or not contenido:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)

        # A. Guardar el Post Original (Semilla)
        nuevo_post = Post.objects.create(titulo=titulo, contenido_original=contenido)

        # B. Llamar a Gemini
        adaptaciones_json = adaptar_contenido_con_gemini(titulo, contenido)
        
        if "error" in adaptaciones_json:
            return Response(adaptaciones_json, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # C. Guardar las Adaptaciones como "Borradores" (Drafts)
        response_data = {"post_id": nuevo_post.id, "adaptaciones": {}}
        
        for plataforma, datos in adaptaciones_json.items():
            texto_adaptado = datos.get('text', '')
            hashtags = datos.get('hashtags', [])
            
            pub = Publication.objects.create(
                post=nuevo_post,
                plataforma=plataforma,
                contenido_adaptado=texto_adaptado,
                hashtags=hashtags,
                estado='draft'
            )
            
            response_data["adaptaciones"][plataforma] = {
                "id": pub.id,
                "texto": texto_adaptado,
                "hashtags": hashtags,
                "image_prompt": datos.get('suggested_image_prompt'),
                "generated_image_url": datos.get('generated_image_url'),
                "video_hook": datos.get('video_hook')
            }

        return Response(response_data, status=status.HTTP_201_CREATED)

class PublicarContenidoView(APIView):
    """
    Recibe el ID de una Publicación y la lanza a la API real.
    """
    def post(self, request, *args, **kwargs):
        publication_id = request.data.get('publication_id')
        image_url = request.data.get('image_url') 
        video_url = request.data.get('video_url')
        whatsapp_number = request.data.get('whatsapp_number')
        try:
            pub = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            return Response({"error": "Publicación no encontrada"}, status=404)

        # Incrementar contador de reintentos
        pub.retry_count += 1
        pub.save()

        resultado = {}

        # --- SWITCH DE PLATAFORMAS ---
        if pub.plataforma == 'facebook':
            # Facebook ahora soporta imagen opcional
            resultado = publicar_en_facebook(pub.contenido_adaptado, image_url)
            
        elif pub.plataforma == 'whatsapp':
            if not whatsapp_number:
                return Response({"error": "WhatsApp requiere número destino"}, status=400)
            resultado = publicar_en_whatsapp(pub.contenido_adaptado, whatsapp_number)

        elif pub.plataforma == 'instagram':
            resultado = publicar_en_instagram(pub.contenido_adaptado, image_url)

        elif pub.plataforma == 'linkedin':
            resultado = publicar_en_linkedin(pub.contenido_adaptado)
            
        elif pub.plataforma == 'tiktok':
            # Usar video_url si viene en el request, sino intentar usar image_url o fallar
            media_url = video_url or image_url
            if not media_url:
                 return Response({"error": "TikTok requiere video_url"}, status=400)
            resultado = publicar_en_tiktok(media_url, pub.contenido_adaptado)

        # --- ACTUALIZAR BD Y NOTIFICAR ---
        if resultado.get('status') == 'success':
            pub.estado = 'published'
            pub.api_id = str(resultado.get('id') or resultado.get('sid'))
            pub.published_url = resultado.get('url', '')
            pub.fecha_publicacion = timezone.now()
            pub.last_error = None
            
            # Notificar éxito
            notify_success(pub.plataforma, pub.post.id, pub.api_id)
            
        elif resultado.get('status') == 'manual_action_required':
            pub.estado = 'manual'
            notify_manual_action(pub.plataforma, pub.post.id)
            
        else:
            pub.estado = 'failed'
            error_msg = str(resultado.get('message'))
            pub.error_log = error_msg
            pub.last_error = error_msg
            
            # Notificar error
            notify_error(pub.plataforma, pub.post.id, error_msg)

        pub.save()

        return Response(resultado, status=200)

class EliminarPostView(APIView):
    """
    Endpoint para eliminar un Post y todas sus Publicaciones asociadas.
    Endpoint: DELETE /api/posts/<id>/
    """
    def delete(self, request, id, *args, **kwargs):
        try:
            post = Post.objects.get(id=id)
            post_titulo = post.titulo
            
            # models.CASCADE en el ForeignKey asegura que las Publicaciones se eliminen automáticamente
            post.delete()
            
            return Response(
                {"success": f"Post '{post_titulo}' (ID: {id}) y sus publicaciones eliminados correctamente."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Post.DoesNotExist:
            return Response(
                {"error": f"Post con ID {id} no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

class UploadMediaView(APIView):
    """
    Sube un archivo (imagen o video) y devuelve su URL pública.
    """
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)
        
        # Guardar archivo
        file_name = default_storage.save(file_obj.name, ContentFile(file_obj.read()))
        file_url = request.build_absolute_uri(default_storage.url(file_name))
        
        return Response({"url": file_url}, status=201)

# --- VISTAS DE LECTURA (GET) ---

class ListaPostsView(generics.ListAPIView):
    """
    Devuelve la lista de todos los posts y sus estados.
    Endpoint: GET /api/posts/
    """
    queryset = Post.objects.all().order_by('-fecha_creacion')
    serializer_class = PostSerializer

class DetallePostView(generics.RetrieveAPIView):
    """
    Devuelve un post específico por su ID.
    Endpoint: GET /api/posts/<id>/
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'id'

# --- TIKTOK AUTH ---

class TikTokAuthView(APIView):
    def get(self, request):
        # Ahora get_tiktok_auth_url devuelve (url, code_verifier)
        auth_url, code_verifier = get_tiktok_auth_url()
        
        if auth_url and code_verifier:
            # Guardar el code_verifier en la sesión para usarlo en el callback
            request.session['tiktok_code_verifier'] = code_verifier
            
            # Redirigir automáticamente a TikTok
            return redirect(auth_url)
            
        return Response({"error": "No se pudo generar la URL de autenticación. Revisa las credenciales."}, status=500)

class TikTokCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        if error:
             return Response({"error": f"TikTok Error: {error}"}, status=400)

        if not code:
            return Response({"error": "No se recibió el código de autorización"}, status=400)
            
        # Recuperar el code_verifier de la sesión
        code_verifier = request.session.get('tiktok_code_verifier')
        
        if not code_verifier:
            return Response({"error": "Falta el code_verifier en la sesión. Reinicia el flujo de autenticación."}, status=400)
            
        # Intercambiar código por token usando el verifier
        token_data = get_tiktok_access_token(code, code_verifier)
        
        if "error" in token_data:
            return Response(token_data, status=400)
        # Limpiar el verifier de la sesión
        if 'tiktok_code_verifier' in request.session:
            del request.session['tiktok_code_verifier']

        # Guardar el token en la base de datos
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in') # Segundos
        
        if access_token:
            from .models import SocialCredential
            from django.utils import timezone
            import datetime
            
            expires_at = timezone.now() + datetime.timedelta(seconds=expires_in) if expires_in else None
            
            SocialCredential.objects.update_or_create(
                plataforma='tiktok',
                defaults={
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'expires_at': expires_at
                }
            )

        # Mostrar página de éxito amigable
        html = f'''
        <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }}
                    .container {{
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        text-align: center;
                        max-width: 500px;
                    }}
                    h1 {{
                        color: #00f2ea;
                        margin-bottom: 20px;
                    }}
                    .checkmark {{
                        font-size: 60px;
                        color: #00f2ea;
                        margin-bottom: 20px;
                    }}
                    p {{
                        color: #666;
                        line-height: 1.6;
                    }}
                    .token-info {{
                        background: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #999;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="checkmark">✓</div>
                    <h1>¡Autenticación Exitosa!</h1>
                    <p>Tu cuenta de TikTok ha sido conectada correctamente.</p>
                    <p>Ahora puedes cerrar esta ventana y volver a tu aplicación.</p>
                    <div class="token-info">
                        Token válido por {expires_in // 3600} horas
                    </div>
                </div>
            </body>
        </html>
        '''
        return HttpResponse(html)

class TikTokTokenView(APIView):
    def get(self, request):
        cred = SocialCredential.objects.filter(plataforma='tiktok').first()
        if cred:
            return Response({
                'access_token': cred.access_token,
                'refresh_token': cred.refresh_token,
                'expires_at': cred.expires_at
            })
        return Response({"error": "No token found"}, status=404)