# 🚀 Sistema de Publicación y Adaptación de Contenido para Redes Sociales

## 📖 Descripción del Proyecto

Este es un sistema completo de adaptación y publicación de contenido para múltiples redes sociales. Utiliza inteligencia artificial (OpenAI GPT-3.5 Turbo) para transformar contenido original y adaptarlo automáticamente a las mejores prácticas de cada plataforma social, además de contar con APIs para publicación directa en Facebook e Instagram.

### LINK DEL REPOSITORIO 
https://github.com/jhoanyflores/topicosRedesSociales-.git

### 🎯 Funcionalidades Principales

- **Adaptación Inteligente de Contenido**: Transforma texto original para optimizarlo según las características específicas de cada red social
- **Publicación Automatizada**: APIs para publicar directamente en Facebook e Instagram Business
- **Soporte Multi-plataforma**: Facebook, Instagram, LinkedIn, TikTok, WhatsApp
- **Validación de Contenido**: Sistema de pruebas para verificar la calidad de las transformaciones
- **Interfaz API REST**: Endpoints FastAPI para integración con otras aplicaciones
- **Interfaz Flask**: Servidor dedicado para publicaciones en Instagram

## 🏗️ Arquitectura del Proyecto

```
📁 top/
├── 📄 main.py                          # Servidor principal FastAPI
├── 📄 app_instagram.py                 # Servidor Flask para Instagram
├── 📄 requirements.txt                 # Dependencias del proyecto
├── 📁 src/                            # Código fuente principal
│   ├── 📁 api/                        # APIs y endpoints
│   │   ├── 📄 routes.py               # Rutas principales FastAPI
│   │   └── 📄 publish_routes.py       # Rutas de publicación
│   └── 📁 services/                   # Servicios de negocio
│       ├── 📄 llm_adapter.py          # Motor de adaptación con IA
│       ├── 📄 facebook_publisher.py   # Publicador de Facebook
│       ├── 📄 instagram_publisher.py  # Publicador de Instagram
│       └── 📄 personal_publisher.py   # Publicador personal
├── 📁 tests/                          # Suite de pruebas
│   └── 📄 test_all_cases.py          # Casos de validación
├── 📁 docs/                           # Documentación
│   ├── 📄 prompts.md                  # Documentación de prompts IA
│   └── 📄 clase-02-desarrollo.md      # Documentación de desarrollo
└── 📄 test_publicacion_imagen.py     # Prueba de publicación con imágenes
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Python 3.8 o superior
- Cuenta de desarrollador de Facebook/Meta
- OpenAI API Key
- Tokens de acceso para Facebook e Instagram Business

### 1. Instalación de Dependencias

```powershell
# Navegar al directorio del proyecto
cd c:\Users\xmrpa\Downloads\AnnyTopicos\top

# Instalar dependencias
pip install -r requirements.txt

# Dependencias adicionales si es necesario
pip install fastapi uvicorn flask requests openai python-dotenv pytest
```

### 2. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# OpenAI Configuration
OPENAI_API_KEY=tu_openai_api_key_aqui

# Facebook Configuration
FACEBOOK_ACCESS_TOKEN=tu_facebook_access_token
FACEBOOK_PAGE_ID=tu_facebook_page_id

# Instagram Configuration  
INSTAGRAM_ACCESS_TOKEN=tu_instagram_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=tu_instagram_business_id
```

### 3. Obtención de Tokens de Facebook/Instagram

1. **Facebook Page Access Token**:
   - Ir a [Facebook Developers](https://developers.facebook.com/)
   - Crear una aplicación
   - Generar token de página con permisos: `pages_manage_posts`, `pages_read_engagement`

2. **Instagram Business Account ID**:
   - Conectar cuenta de Instagram Business a la página de Facebook
   - Usar Graph API Explorer para obtener el ID
   - Permisos necesarios: `instagram_basic`, `instagram_content_publish`

## 🚀 Cómo Ejecutar el Sistema

### Opción 1: Servidor Principal FastAPI (Recomendado)

```powershell
# Ejecutar servidor principal
python main.py

# El servidor estará disponible en:
# - API: http://localhost:8000
# - Documentación: http://localhost:8000/docs
```

### Opción 2: Servidor Instagram Flask

```powershell
# Ejecutar servidor específico de Instagram
python app_instagram.py

# El servidor estará disponible en:
# - API: http://localhost:8080
# - Endpoint: http://localhost:8080/api/publish/instagram
```

### Opción 3: Modo Interactivo (Adaptación de Contenido)

```powershell
# Ejecutar adaptador de contenido interactivo
python src/services/llm_adapter.py
```

## 📋 Uso del Sistema - Paso a Paso

### 1. Adaptación de Contenido con IA

**Endpoint**: `POST http://localhost:8000/api/adapt-content`

**Ejemplo de Request**:
```json
{
    "titulo": "Lanzamiento de nuestro nuevo producto",
    "contenido": "Estamos emocionados de anunciar el lanzamiento de nuestra nueva plataforma digital que revolucionará la manera en que trabajas. Con características innovadoras y una interfaz intuitiva, esta herramienta transformará tu productividad.",
    "target_networks": ["facebook", "instagram", "linkedin", "tiktok", "whatsapp"]
}
```

**Ejemplo de Respuesta**:
```json
{
    "facebook": {
        "text": "🚀 ¡Gran noticia! Lanzamos nuestra nueva plataforma digital que cambiará tu forma de trabajar. Con características innovadoras e interfaz intuitiva, tu productividad llegará al siguiente nivel. ¿Listos para la revolución digital?",
        "hashtags": ["#innovacion", "#tecnologia", "#lanzamiento", "#productividad"],
        "character_count": 245,
        "tone": "conversacional y cercano"
    },
    "instagram": {
        "text": "✨ ¡El futuro está aquí! 🌟 Presentamos nuestra revolución digital 💫\n\n🔥 Nueva plataforma que transformará tu productividad\n🎯 Características innovadoras\n✨ Interfaz súper intuitiva\n\n¿Estás listo para el cambio? 💪",
        "hashtags": ["#innovation", "#tech", "#newlaunch", "#digital", "#future", "#productivity"],
        "character_count": 289,
        "tone": "inspirador y visual",
        "suggested_image_prompt": "Imagen moderna y tecnológica con colores vibrantes (azul y naranja), mostrando una interfaz futurista de la plataforma, con elementos visuales que representen productividad y innovación"
    }
}
```

### 2. Publicación en Facebook

**Endpoint**: `POST http://localhost:8000/api/publish/facebook`

```json
{
    "text": "¡Contenido optimizado para Facebook!",
    "access_token": "tu_access_token"
}
```

### 3. Publicación en Instagram

**Endpoint**: `POST http://localhost:8000/api/publish/instagram` o `POST http://localhost:8080/api/publish/instagram`

```json
{
    "text": "¡Contenido optimizado para Instagram! #hashtag",
    "image_url": "https://ejemplo.com/imagen.jpg",
    "access_token": "tu_access_token"
}
```

## 🎯 Características por Plataforma

### Facebook
- **Estilo**: Conversacional y cercano
- **Límite**: 63,206 caracteres
- **Emojis**: Moderado (1-3 por publicación)
- **Hashtags**: Máximo 5
- **Objetivo**: Generar interacción y comentarios

### Instagram
- **Estilo**: Visual, inspirador y moderno
- **Límite**: 2,200 caracteres
- **Emojis**: Abundante para impacto visual
- **Hashtags**: 5-10 etiquetas
- **Extra**: Sugerencias de contenido visual (`suggested_image_prompt`)
- **Objetivo**: Narrativa visual y engagement

### LinkedIn
- **Estilo**: Profesional e informativo  
- **Límite**: 3,000 caracteres
- **Emojis**: Mínimo, solo para énfasis
- **Hashtags**: 3-5 enfocadas en sector
- **Objetivo**: Valor profesional y networking

### TikTok
- **Estilo**: Dinámico y entretenido
- **Límite**: 4,000 caracteres
- **Emojis**: Expresivo y abundante
- **Hashtags**: 3-8 incluyendo tendencias
- **Extra**: Sugerencias de contenido audiovisual (`suggested_video_prompt`)
- **Objetivo**: Entretenimiento y viralidad

### WhatsApp
- **Estilo**: Personal y directo
- **Límite**: 4,000 caracteres (preferible conciso)
- **Emojis**: Natural como conversación
- **Hashtags**: Evitar o muy pocas (1-2)
- **Objetivo**: Comunicación directa

## 🧪 Sistema de Pruebas

### Ejecutar Validaciones Completas

```powershell
# Ejecutar todas las pruebas
python tests/test_all_cases.py --all

# Ejecutar caso específico
python tests/test_all_cases.py --caso empresarial

# Modo interactivo
python tests/test_all_cases.py --interactive

# Ver casos disponibles
python tests/test_all_cases.py --list
```

### Casos de Prueba Incluidos

1. **Caso Empresarial**: Comunicado corporativo sobre hitos (15,000 usuarios)
2. **Caso Lanzamiento**: Anuncio de nuevo producto (InnovatePro 3.0)
3. **Caso Actividad**: Promoción de eventos (Congreso DigitalNext 2025)

### Prueba de Publicación con Imágenes

```powershell
# Probar publicación de imágenes en Facebook
python test_publicacion_imagen.py
```

## 📊 Monitoreo y Logs

El sistema incluye logging detallado para monitorear:

- ✅ Transformaciones exitosas
- ❌ Errores de procesamiento  
- 📊 Métricas de caracteres por plataforma
- 🔍 Validación de campos específicos
- 📡 Respuestas de APIs de publicación

## 🔧 Configuración Avanzada

### Personalizar Niveles de Creatividad

En `src/services/llm_adapter.py`:

```python
CREATIVITY_CONFIG = {
    "facebook": 0.7,    # Balance creatividad/coherencia
    "instagram": 0.8,   # Alta creatividad visual
    "linkedin": 0.5,    # Profesional y consistente
    "tiktok": 0.9,      # Máxima creatividad viral
    "whatsapp": 0.6     # Personal pero coherente
}
```

### Ajustar Límites de Caracteres

```python
PLATFORM_LIMITS = {
    "facebook": 63206,
    "instagram": 2200,
    "linkedin": 3000,
    "tiktok": 4000,
    "whatsapp": 4000
}
```

## 🚨 Solución de Problemas Comunes

### Error: "OpenAI API Key no configurada"
```powershell
# Verificar variables de entorno
$env:OPENAI_API_KEY
# Configurar si no existe
$env:OPENAI_API_KEY="tu_api_key_aqui"
```

### Error: "Facebook/Instagram token inválido"
1. Verificar que el token no haya expirado
2. Confirmar permisos necesarios en Facebook Developers
3. Regenerar token si es necesario

### Error: "LLM adapter no disponible"
1. Verificar instalación de OpenAI: `pip install openai`
2. Confirmar API Key válida
3. Verificar conexión a internet

### Error: "ModuleNotFoundError"
```powershell
# Instalar dependencias faltantes
pip install -r requirements.txt
# O instalar individualmente
pip install fastapi uvicorn flask requests openai python-dotenv
```

## 📈 Funcionalidades Avanzadas

### Usar con Postman

1. **Adaptación de Contenido**:
   - POST `http://localhost:8000/api/adapt-content`
   - Headers: `Content-Type: application/json`

2. **Publicación Instagram**:
   - POST `http://localhost:8080/api/publish/instagram`
   - Body: JSON con `text`, `image_url`, `access_token`

### Uso Programático en Python

```python
import requests

# Adaptar contenido
response = requests.post('http://localhost:8000/api/adapt-content', json={
    "titulo": "Mi título",
    "contenido": "Mi contenido...",
    "target_networks": ["facebook", "instagram"]
})

adapted_content = response.json()

# Publicar en Instagram
instagram_response = requests.post('http://localhost:8080/api/publish/instagram', json={
    "text": adapted_content["instagram"]["text"],
    "image_url": "https://mi-imagen.jpg",
    "access_token": "mi_token"
})
```

## 🤝 Casos de Uso Reales

### 1. Empresa que lanza producto
```powershell
# 1. Adaptar contenido
python src/services/llm_adapter.py
# 2. Usar contenido adaptado en endpoints de publicación
# 3. Verificar resultados en redes sociales
```

### 2. Agencia de marketing
```powershell
# 1. Ejecutar servidor FastAPI
python main.py
# 2. Integrar con herramientas existentes vía API
# 3. Automatizar publicaciones masivas
```

### 3. Desarrollador independiente
```powershell
# 1. Usar modo interactivo para contenido personal
python src/services/llm_adapter.py
# 2. Copiar y pegar en redes sociales manualmente
```

## 📝 Flujo de Trabajo Completo

### Paso a Paso para Usar el Sistema:

1. **Configuración Inicial**:
   ```powershell
   cd c:\Users\xmrpa\Downloads\AnnyTopicos\top
   pip install -r requirements.txt
   # Crear .env con tus API keys
   ```

2. **Iniciar Servidor**:
   ```powershell
   python main.py
   ```

3. **Adaptar Contenido** (vía API o interfaz):
   - URL: `http://localhost:8000/docs`
   - Usar endpoint `/api/adapt-content`

4. **Publicar Contenido**:
   - Facebook: `/api/publish/facebook`
   - Instagram: `/api/publish/instagram`

5. **Validar Resultados**:
   ```powershell
   python tests/test_all_cases.py --interactive
   ```

## 🔒 Consideraciones de Seguridad

- ⚠️ **Nunca** commitear tokens o API keys al repositorio
- 🛡️ Usar variables de entorno para credenciales
- 🔐 Regenerar tokens periódicamente
- 📱 Usar HTTPS en producción
- 🚫 No incluir información sensible en logs

## 📞 Soporte y Documentación

- **Documentación API**: `http://localhost:8000/docs` (cuando el servidor esté corriendo)
- **Logs**: Revisar terminal para errores específicos
- **Validación**: Usar casos de prueba incluidos
- **Facebook API**: [Documentación oficial](https://developers.facebook.com/docs/graph-api)
- **Instagram API**: [Documentación oficial](https://developers.facebook.com/docs/instagram-api)

---

## 🎉 ¡Listo para Comenzar!

**Comando rápido para iniciar**:
```powershell
cd c:\Users\xmrpa\Downloads\AnnyTopicos\top
python main.py
```

**Luego visita**: `http://localhost:8000/docs` para ver la documentación interactiva de la API.

¡Tu sistema de publicación multi-plataforma está listo para revolucionar tu contenido en redes sociales! 🚀