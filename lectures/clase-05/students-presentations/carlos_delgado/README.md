# 🎓 UAGRM Noticias IA

**Generador de Contenido para Redes Sociales con Inteligencia Artificial**

Sistema inteligente que genera automáticamente publicaciones optimizadas para múltiples redes sociales universitarias utilizando OpenAI GPT y DALL-E.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Angular](https://img.shields.io/badge/angular-17+-red.svg)

---

## 📋 Descripción

UAGRM Noticias IA es una aplicación web que permite a las instituciones universitarias crear contenido profesional y atractivo para redes sociales de manera automática. Con solo proporcionar un título y descripción de la noticia, el sistema genera publicaciones personalizadas para cada plataforma social, incluyendo texto optimizado e imágenes generadas por IA.

### ✨ Características Principales

- 🤖 **Generación Automática de Contenido** - Crea textos optimizados para cada red social
- 🎨 **Imágenes con IA** - Genera imágenes únicas usando DALL-E 3
- 📱 **Multi-Plataforma** - Soporta Facebook, Instagram, WhatsApp, LinkedIn y TikTok
- 🚀 **Publicación Directa** - Publica automáticamente en las redes sociales
- 💬 **Interfaz Tipo Chat** - Diseño intuitivo similar a ChatGPT
- 🎯 **Contexto Académico** - Especializado en contenido universitario

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos componentes principales:

### 🔧 Backend (FastAPI + Python)

**Ubicación:** `backend/`

El backend es una API REST construida con FastAPI que maneja toda la lógica de negocio:

#### Componentes Principales:

- **`app/main.py`** - Punto de entrada de la aplicación FastAPI
- **`app/api/routes.py`** - Endpoints de la API (`/generate`, `/publish`)
- **`app/services/`** - Servicios de negocio:
  - `content_generator.py` - Genera texto usando OpenAI GPT-4
  - `media_generator.py` - Crea imágenes con DALL-E 3
  - `social_publisher.py` - Orquesta la publicación en redes sociales
  - `publishers/` - Adaptadores para cada red social (Facebook, Instagram, WhatsApp, LinkedIn, TikTok)

#### Funcionalidades:

1. **Generación de Contenido** (`POST /api/generate`)
   - Recibe: título, descripción y plataformas seleccionadas
   - Procesa: genera texto optimizado para cada plataforma usando GPT-4
   - Crea: imagen relevante usando DALL-E 3
   - Retorna: contenido completo listo para publicar

2. **Publicación Automática** (`POST /api/publish`)
   - Recibe: plataforma, texto y URL de medios
   - Publica: directamente en la red social seleccionada
   - Retorna: confirmación de éxito o error

#### Tecnologías:

- **FastAPI** - Framework web moderno y rápido
- **OpenAI API** - GPT-4 para texto, DALL-E 3 para imágenes
- **Meta Graph API** - Publicación en Facebook/Instagram
- **WhatsApp Cloud API** - Mensajería empresarial
- **LinkedIn API** - Publicación profesional
- **Pydantic** - Validación de datos
- **CORS** - Habilitado para desarrollo

---

### 🎨 Frontend (Angular)

**Ubicación:** `frontend/`

El frontend es una aplicación Angular con diseño moderno tipo ChatGPT:

#### Componentes Principales:

- **`src/app/components/content-generator/`** - Componente principal del chat
  - `content-generator.component.ts` - Lógica del componente
  - `content-generator.component.html` - Estructura del chat
  - `content-generator.component.css` - Estilos (diseño ChatGPT)
- **`src/app/services/api.service.ts`** - Servicio para comunicación con backend

#### Funcionalidades:

1. **Interfaz de Chat**
   - Sidebar con historial de conversaciones
   - Botón "Nuevo Chat" para limpiar conversación
   - Mensajes alternados (usuario/IA)
   - Indicador de carga con animación

2. **Generación de Contenido**
   - Selección de plataformas (Facebook, Instagram, WhatsApp, LinkedIn, TikTok)
   - Input de título y descripción
   - Visualización de resultados en tarjetas (grid responsive)
   - Preview de imágenes generadas

3. **Publicación con Estados**
   - Botón "Publicar" (negro)
   - Estado "Publicando..." (gris con spinner)
   - Estado "✓ Publicado" (verde, deshabilitado)
   - Prevención de publicaciones duplicadas

#### Diseño:

- **Esquema de Colores**: Blanco y negro minimalista
- **Layout**: Tipo ChatGPT con sidebar lateral
- **Input Flotante**: Carta elevada en la parte inferior
- **Responsive**: Grid adaptable para las tarjetas de resultados
- **Animaciones**: Transiciones suaves y micro-interacciones

#### Tecnologías:

- **Angular 17+** - Framework frontend
- **TypeScript** - Lenguaje tipado
- **RxJS** - Programación reactiva
- **FormsModule** - Manejo de formularios
- **HttpClient** - Comunicación HTTP

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- Node.js 18+
- Cuenta de OpenAI con API Key
- (Opcional) Credenciales de Meta, WhatsApp, LinkedIn para publicación

### 1. Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd LLM_Social_Topicos
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Crear archivo .env con:
OPENAI_API_KEY=tu_api_key_aqui
# (Opcional para publicación)
# FACEBOOK_ACCESS_TOKEN=...
# INSTAGRAM_ACCESS_TOKEN=...
# WHATSAPP_PHONE_NUMBER_ID=...
# WHATSAPP_ACCESS_TOKEN=...
# LINKEDIN_ACCESS_TOKEN=...

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

El backend estará disponible en `http://localhost:8080`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

El frontend estará disponible en `http://localhost:4200`

---

## 📖 Uso

1. **Abrir la aplicación** en `http://localhost:4200`
2. **Seleccionar plataformas** donde quieres publicar (Facebook, Instagram, etc.)
3. **Escribir título** de la noticia (ej: "Inscripciones 2025")
4. **Agregar detalles** de la noticia en el área de texto
5. **Hacer click en ➤** o presionar `Ctrl+Enter` para generar
6. **Esperar** mientras la IA genera el contenido (texto + imagen)
7. **Revisar** las publicaciones generadas en las tarjetas
8. **Publicar** haciendo click en el botón "Publicar" de cada tarjeta
9. **Observar** el cambio de estado: Publicando... → ✓ Publicado

---

## 🎯 Casos de Uso

- **Oficinas de Comunicación Universitaria** - Automatizar publicaciones de noticias
- **Departamentos Académicos** - Difundir eventos y convocatorias
- **Centros de Estudiantes** - Compartir actividades y logros
- **Administración** - Comunicar avisos importantes

---

## 🔒 Seguridad

- Las API keys se manejan mediante variables de entorno
- CORS configurado para desarrollo (ajustar para producción)
- Validación de datos con Pydantic
- Manejo de errores en todas las capas

---

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI
- Python 3.8+
- OpenAI API (GPT-4, DALL-E 3)
- Pydantic
- Uvicorn

### Frontend
- Angular 17+
- TypeScript
- RxJS
- CSS3 (Flexbox, Grid, Animations)

### APIs Externas
- OpenAI (Generación de contenido)
- Meta Graph API (Facebook/Instagram)
- WhatsApp Cloud API
- LinkedIn API

---

## 📝 Estructura de Directorios

```
LLM_Social_Topicos/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── services/
│   │   │   ├── content_generator.py
│   │   │   ├── media_generator.py
│   │   │   ├── social_publisher.py
│   │   │   └── publishers/
│   │   │       ├── base.py
│   │   │       ├── facebook.py
│   │   │       ├── instagram.py
│   │   │       ├── whatsapp.py
│   │   │       ├── linkedin.py
│   │   │       └── tiktok.py
│   │   └── main.py
│   ├── static/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── content-generator/
│   │   │   ├── services/
│   │   │   │   └── api.service.ts
│   │   │   └── app.config.ts
│   │   └── main.ts
│   ├── package.json
│   └── angular.json
└── README.md
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👥 Autor

**UAGRM - Universidad Autónoma Gabriel René Moreno**

---

## 🔗 Enlaces

- **Repositorio:** [URL_DEL_REPOSITORIO_AQUI]
- **Documentación OpenAI:** https://platform.openai.com/docs
- **Meta for Developers:** https://developers.facebook.com
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **LinkedIn API:** https://docs.microsoft.com/en-us/linkedin

---

## 📞 Soporte

Para preguntas o problemas, por favor abre un issue en el repositorio.

---

**Hecho con ❤️ para la comunidad universitaria**
