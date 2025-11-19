# Servicios del Chatbot - Noticias UAGRM

## 1. ChatbotService

Gestiona la conversación con el usuario y orquesta todo el flujo de generación y publicación de posts.

1. Recibe el mensaje del usuario a través del endpoint
2. Crea o recupera un chat existente en la base de datos
3. Guarda el mensaje del usuario
4. Llama a `PostsService` para validar si es una noticia válida
5. Si es válida, genera los 5 posts para todas las plataformas
6. Llama a `SocialMediaPublisherService` para publicar automáticamente en Facebook e Instagram
7. Guarda todo en BD: chats, mensajes y posts generados
8. Retorna una respuesta con el resultado de las publicaciones

- Gestión de chats y mensajes
- Coordinación entre servicios
- Almacenamiento en base de datos
- Respuesta al usuario con resultados

---

## 2. PostsService

Valida noticias relacionadas con UAGRM/FCCT y genera contenido optimizado para redes sociales.

**Llamadas API (2 llamadas ):**

#### Llamada 1/2: Validación + Generación de textos
- Valida si el contenido es relevante para UAGRM/FCCT
- Si es válido, genera los 5 textos en una sola llamada:
  - Instagram (2200 caracteres, emojis, 5-10 hashtags)
  - Facebook (500 palabras, tono informativo, 3-5 hashtags)
  - TikTok (Script 30-60 seg, lenguaje juvenil)
  - LinkedIn (150-300 palabras, profesional)
  - WhatsApp (100-200 palabras, conversacional)

#### Llamada 2/2: Generación de imagen compartida
- Genera 1 imagen con DALL-E 3
- La misma imagen se usa en todas las plataformas
- Validación de contenido relevante
- Generación de textos con IA (GPT-4o-mini)
- Generación de imágenes con IA (DALL-E 3)
- Almacenamiento de posts en BD


---

## 3. SocialMediaPublisherService

Publica posts automáticamente en Facebook e Instagram utilizando la API de Facebook Graph.

#### Facebook (1 request)
1. Envía POST a `/photos` con:
   - Caption (texto del post)
   - URL de la imagen
   - Access token
2. Retorna el ID del post publicado

#### Instagram (2 requests)
1. **Paso 1:** Crea un media container
   - POST a `/media` con caption e image_url
   - Retorna creation_id
2. **Paso 2:** Publica el contenedor
   - POST a `/media_publish` con creation_id
   - Retorna el ID del post publicado

- Integración con Facebook Graph API v24.0
- Manejo de errores de publicación
- Retorno de resultados (éxito/error) por plataforma
- Configuración de tokens y credenciales
