# PublIA Backend 🤖

API backend para la generación de contenido de redes sociales potenciada por Inteligencia Artificial. Este servicio utiliza OpenAI GPT para generar posts optimizados para Facebook, Instagram y LinkedIn, además de generar imágenes con DALL-E y gestionar uploads con Cloudinary.

## 📋 Descripción

PublIA-Back es un backend desarrollado con NestJS que proporciona endpoints para:

- **Generación de posts para redes sociales**: Crea contenido optimizado para Facebook, Instagram y LinkedIn con un solo prompt
- **Generación de imágenes con IA**: Utiliza DALL-E 3 para crear imágenes personalizadas
- **Chat conversacional**: Interfaz de chat con contexto persistente usando OpenAI
- **Gestión de imágenes**: Upload y almacenamiento en Cloudinary

## 🚀 Características

### Módulo GPT
- ✨ Generación inteligente de posts adaptados a cada red social
- 🎨 Generación de imágenes con DALL-E 3
- 💬 Chat conversacional con contexto
- 📊 Validación automática de límites de caracteres por plataforma
- 🏷️ Generación automática de hashtags relevantes
- 🎯 Prompts optimizados con estrategias de Role-Based y Structured Output

### Módulo Cloudinary
- ☁️ Upload de imágenes en base64
- 📁 Upload de archivos multipart
- 🗂️ Organización en carpetas personalizadas

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Runtime**: Node.js con TypeScript
- **IA**: OpenAI API (GPT-4, DALL-E 3)
- **Almacenamiento**: Cloudinary
- **Validación**: class-validator, class-transformer
- **Procesamiento de imágenes**: Sharp
- **Testing**: Jest

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jhersON1/PublIA-back.git
cd publ-ia-back

# Instalar dependencias
npm install
```

## ⚙️ Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto basado en `.env.template`:

```env
# OpenAI
OPENAI_API_KEY=tu_api_key_de_openai

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Server
SERVER_URL=http://localhost:3000
PORT=3000
```

### Obtener las API Keys

1. **OpenAI**: Regístrate en [platform.openai.com](https://platform.openai.com/)
2. **Cloudinary**: Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com/)

## 🏃‍♂️ Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### GPT Module

#### POST `/gpt/chat`
Chat conversacional con contexto persistente.

```json
{
  "prompt": "Cuéntame sobre marketing digital",
  "previousResponseId": "optional-conversation-id"
}
```

#### POST `/gpt/generate-posts`
Genera posts optimizados para Facebook, Instagram y LinkedIn.

```json
{
  "prompt": "Lanzamiento de nuevo producto eco-friendly de limpieza del hogar"
}
```

**Respuesta:**
```json
{
  "posts": {
    "facebook": {
      "platform": "facebook",
      "text": "...",
      "hashtags": ["#EcoFriendly", "#Sostenible"],
      "character_count": 245
    },
    "instagram": {
      "platform": "instagram",
      "text": "...",
      "hashtags": ["#EcoFriendly", "#ProductoVerde"],
      "character_count": 180,
      "suggested_image_prompt": "Producto de limpieza ecológico..."
    },
    "linkedin": {
      "platform": "linkedin",
      "text": "...",
      "hashtags": ["#Sostenibilidad", "#Innovación"],
      "character_count": 320,
      "tone": "professional"
    }
  }
}
```

#### POST `/gpt/generate-image`
Genera imágenes usando DALL-E 3 y las sube automáticamente a Cloudinary.

```json
{
  "prompt": "Un paisaje futurista con tecnología sostenible",
  "previousResponseId": "optional-conversation-id"
}
```

**Respuesta:**
```json
{
  "url": "https://res.cloudinary.com/.../image.png",
  "revised_prompt": "A futuristic landscape featuring..."
}
```

### Cloudinary Module

#### POST `/cloudinary/upload`
Sube una imagen en formato base64.

```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgo...",
  "folder": "mi-carpeta"
}
```

#### POST `/cloudinary/upload-file`
Sube un archivo usando multipart/form-data.

```
Content-Type: multipart/form-data
file: [binary]
```

## 🎯 Estrategias de Prompting

El proyecto implementa varias estrategias avanzadas de prompting:

### 1. Role-Based Prompting
Define roles específicos para obtener respuestas más precisas:
```typescript
"Eres un redactor de social media senior..."
```

### 2. Structured Output
Garantiza respuestas en formato JSON válido con schemas estrictos:
```typescript
"Devuelve SOLO JSON válido que cumpla el schema"
```

### 3. Constraint-Based Generation
Aplica reglas específicas por plataforma:
- **Facebook**: Tono casual/formal, hasta 63,206 caracteres
- **Instagram**: Visual y casual, hasta 2,200 caracteres, hashtags importantes
- **LinkedIn**: Profesional, hasta 3,000 caracteres, pocos emojis

### 4. Audience-Aware Adaptation
Adapta el contenido según la audiencia de cada red social

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts           # Módulo principal
├── main.ts                 # Entry point
├── gpt/                    # Módulo de IA
│   ├── controllers/        # Endpoints GPT
│   ├── services/           # Lógica de negocio
│   ├── dto/               # DTOs de validación
│   ├── schemas/           # Schemas de redes sociales
│   ├── prompts/           # Templates de prompts
│   ├── use-cases/         # Casos de uso
│   └── helpers/           # Utilidades
└── cloudinary/            # Módulo de almacenamiento
    ├── controllers/       # Endpoints Cloudinary
    ├── services/         # Lógica de upload
    ├── provider/         # Configuración
    └── dto/             # DTOs de validación
```

## 🔧 Scripts Disponibles

```bash
npm run build          # Compilar el proyecto
npm run format         # Formatear código con Prettier
npm run lint           # Ejecutar ESLint
npm run start          # Iniciar en modo producción
npm run start:dev      # Iniciar en modo desarrollo
npm run start:debug    # Iniciar en modo debug
```

## Despliegue en Vercel

Este proyecto está preparado para ejecutarse en Vercel mediante una función serverless que inicializa NestJS y expone todas las rutas.

- Archivos añadidos:
  - `api/index.ts`: handler serverless que inicia la app Nest y reusa el adaptador de Express sin `listen()`.
  - `vercel.json`: enruta todas las peticiones a `api/index.ts` y configura runtime Node 20.

- Variables de entorno en Vercel (Project Settings → Environment Variables):
  - `OPENAI_API_KEY`
  - `TIKTOK_CLIENT_KEY`
  - `TIKTOK_CLIENT_SECRET`
  - `TIKTOK_REDIRECT_URI=https://<tu-app>.vercel.app/auth/tiktok/callback`
  - Si usas Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

- Pasos de deploy:
  1) Sube el repo a GitHub y conéctalo en Vercel (plan Hobby).
  2) Importa el proyecto. Vercel detectará `api/index.ts` automáticamente.
  3) Define las variables de entorno y realiza el primer deploy.
  4) Prueba `https://<tu-app>.vercel.app/` y `https://<tu-app>.vercel.app/auth/tiktok/login`.
  5) En TikTok Developer Console, registra el Redirect URI exacto: `https://<tu-app>.vercel.app/auth/tiktok/callback`.

Notas:
- Para desarrollo local se usa `src/main.ts` (puerto 3000). En Vercel, `api/index.ts` inicializa la misma app sin abrir puerto.
- Evita loguear tokens en producción; el módulo de TikTok imprime tokens sólo con fines de depuración.

## 📝 Validaciones

El proyecto utiliza `class-validator` para validar todas las peticiones:

- ✅ Tipos de datos correctos
- ✅ Campos requeridos
- ✅ Formatos específicos (base64, strings, etc.)
- ✅ Whitelist de propiedades (rechaza campos no permitidos)

## 🌐 CORS

CORS está habilitado por defecto para permitir peticiones desde cualquier origen durante el desarrollo.

## 📄 Licencia

MIT-LICENCE

## 👨‍💻 Autor

**jhersON1**
- GitHub: [@jhersON1](https://github.com/jhersON1)


**Flujo del backend**
- https://app.eraser.io/workspace/8U91Fe6A3mJOzqjFEyED?origin=share
---
