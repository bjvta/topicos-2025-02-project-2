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

    fecha_publicacion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.plataforma} - {self.post.titulo}"