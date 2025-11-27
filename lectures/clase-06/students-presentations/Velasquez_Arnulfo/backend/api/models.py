from django.db import models

class Post(models.Model):
    """
    Representa el contenido original (semilla) que el usuario quiere publicar.
    """
    titulo = models.CharField(max_length=200)
    contenido_original = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo

class Publication(models.Model):
    """
    Representa la adaptación específica para cada red social.
    """
    PLATAFORMAS = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('linkedin', 'LinkedIn'),
        ('tiktok', 'TikTok'),
        ('whatsapp', 'WhatsApp'),
    ]

    ESTADOS = [
        ('draft', 'Borrador'),            # Generado por Gemini pero no publicado
        ('published', 'Publicado'),       # Enviado exitosamente a la API
        ('failed', 'Fallido'),            # Error al enviar
        ('manual', 'Manual Pendiente'),   # Para TikTok (copiar y pegar)
    ]

    post = models.ForeignKey(Post, related_name='publications', on_delete=models.CASCADE)
    plataforma = models.CharField(max_length=20, choices=PLATAFORMAS)
    contenido_adaptado = models.TextField()
    
    # Campos opcionales para metadatos
    hashtags = models.JSONField(default=list, blank=True) # Guardamos hashtags como lista
    media_url = models.URLField(blank=True, null=True)    # Para URLs de imagen/video
    
    # Estado del envío
    estado = models.CharField(max_length=20, choices=ESTADOS, default='draft')
    api_id = models.CharField(max_length=100, blank=True, null=True) # ID que nos devuelve Facebook/Twilio
    error_log = models.TextField(blank=True, null=True)   # Para guardar errores si falla

    # Nuevos campos para tracking mejorado
from django.db import models

class Post(models.Model):
    """
    Representa el contenido original (semilla) que el usuario quiere publicar.
    """
    titulo = models.CharField(max_length=200)
    contenido_original = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo

class Publication(models.Model):
    """
    Representa la adaptación específica para cada red social.
    """
    PLATAFORMAS = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('linkedin', 'LinkedIn'),
        ('tiktok', 'TikTok'),
        ('whatsapp', 'WhatsApp'),
    ]

    ESTADOS = [
        ('draft', 'Borrador'),            # Generado por Gemini pero no publicado
        ('published', 'Publicado'),       # Enviado exitosamente a la API
        ('failed', 'Fallido'),            # Error al enviar
        ('manual', 'Manual Pendiente'),   # Para TikTok (copiar y pegar)
    ]

    post = models.ForeignKey(Post, related_name='publications', on_delete=models.CASCADE)
    plataforma = models.CharField(max_length=20, choices=PLATAFORMAS)
    contenido_adaptado = models.TextField()
    
    # Campos opcionales para metadatos
    hashtags = models.JSONField(default=list, blank=True) # Guardamos hashtags como lista
    media_url = models.URLField(blank=True, null=True)    # Para URLs de imagen/video
    
    # Estado del envío
    estado = models.CharField(max_length=20, choices=ESTADOS, default='draft')
    api_id = models.CharField(max_length=100, blank=True, null=True) # ID que nos devuelve Facebook/Twilio
    error_log = models.TextField(blank=True, null=True)   # Para guardar errores si falla

    # Nuevos campos para tracking mejorado
    published_url = models.URLField(blank=True, null=True)  # URL de la publicación en la red social
    retry_count = models.IntegerField(default=0)            # Contador de reintentos
    last_error = models.TextField(blank=True, null=True)    # Último error registrado

    fecha_publicacion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.plataforma} - {self.post.titulo}"

class SocialCredential(models.Model):
    """
    Almacena credenciales (tokens) para las plataformas sociales.
    """
    PLATAFORMAS = [
        ('tiktok', 'TikTok'),
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('linkedin', 'LinkedIn'),
    ]

    plataforma = models.CharField(max_length=20, choices=PLATAFORMAS, unique=True)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Credential for {self.plataforma}"