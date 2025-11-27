# 🚀 Motor de Transformación Digital

Un potente motor de transformación de contenido que adapta automáticamente tu material para múltiples plataformas sociales usando inteligencia artificial (OpenAI GPT).

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Plataformas Soportadas](#-plataformas-soportadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [API](#-api)
- [Pruebas](#-pruebas)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

- 🤖 **Transformación automática con IA**: Utiliza OpenAI GPT para adaptar contenido
- 🎯 **Múltiples plataformas**: Facebook, Instagram, LinkedIn, TikTok y WhatsApp
- 🎨 **Adaptación específica**: Cada plataforma tiene su tono y formato optimizado
- 📱 **Modo interactivo**: Interfaz de línea de comandos amigable
- 💾 **Exportación**: Guarda resultados en formato JSON
- 🎨 **Interfaz colorida**: Output visualmente atractivo con chalk
- ⚡ **Rápido y eficiente**: Procesamiento paralelo para múltiples plataformas
- 🛡️ **Validación de entrada**: Verificación de datos y manejo de errores
- 🧪 **Completamente probado**: Suite de pruebas con Jest

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **API Key de OpenAI**

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/floresitaa/top_proy2.git
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=tu_api_key_de_openai_aqui
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Application Configuration
APP_DEBUG=false
APP_LOG_LEVEL=info
```

### Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Navega a la sección "API Keys"
4. Genera una nueva API key
5. Cópiala al archivo `.env`

## 🎯 Uso

### Modo Interactivo

Ejecuta la aplicación en modo interactivo:

```bash
npm start
```

La aplicación te guiará paso a paso:

1. **Ingresa el encabezado**: Título o tema principal del contenido
2. **Ingresa el material**: El contenido completo (presiona Enter en línea vacía para terminar)
3. **Selecciona plataformas**: 
   - Números separados por comas: `1,3,5`
   - Nombres separados por comas: `facebook,instagram`
   - `a` o Enter para seleccionar todas
   - `q` para salir

### Ejemplo de Uso

```
📌 Ingresa el encabezado del material:
> Lanzamiento Nuevo Producto

📄 Ingresa el material completo:
> Estamos emocionados de presentar nuestro nuevo producto revolucionario
> que cambiará la forma en que trabajas y vives.
> Disponible desde el 15 de diciembre.
> 

🌐 SELECCIÓN DE PLATAFORMAS DIGITALES
> facebook,instagram,linkedin

✅ Seleccionadas: Facebook, Instagram, LinkedIn
🔄 Procesando transformación...
```

### Guardar Resultados

Al finalizar, puedes guardar los resultados:
- Los archivos se guardan como `transformacion_digital_YYYY-MM-DD_HHMMSS.json`
- Formato JSON estructurado con el contenido para cada plataforma

## 📱 Plataformas Soportadas

| Plataforma | Características | Límite de caracteres |
|------------|-----------------|---------------------|
| **Facebook** | Tono conversacional y cercano | ~160 caracteres |
| **Instagram** | Inspirador, visual con sugerencias de imagen | ~160 caracteres |
| **LinkedIn** | Profesional e incentivador | ~160 caracteres |
| **TikTok** | Dinámico, entretenido con sugerencias de video | ~160 caracteres |
| **WhatsApp** | Amigable e informativo, conciso | ~70 caracteres |

### Salida por Plataforma

Cada plataforma genera:
- ✅ **Texto adaptado** al tono específico
- 🏷️ **Hashtags relevantes**
- 📊 **Conteo de caracteres**
- 🎭 **Descripción del tono**
- 🎨 **Sugerencias visuales** (Instagram/TikTok)

## 📁 Estructura del Proyecto

```
llm-content-transformer/
├── src/
│   ├── index.js              # Punto de entrada principal
│   ├── validate.js           # Validaciones de entrada
│   └── services/
│       └── llmAdapter.js     # Adaptador para OpenAI
├── tests/
│   └── allCases.test.js      # Suite completa de pruebas
├── .env                      # Variables de entorno
├── .env.example             # Ejemplo de configuración
├── package.json             # Dependencias y scripts
├── README.md               # Esta documentación
└── .gitignore              # Archivos ignorados por Git
```

## 📜 Scripts Disponibles

```bash
# Ejecutar la aplicación
npm start

# Modo desarrollo con auto-recarga
npm run dev

# Ejecutar pruebas
npm test

# Pruebas en modo watch
npm run test:watch

# Cobertura de pruebas
npm run test:coverage

# Linting
npm run lint

# Formateo de código
npm run format

# Validación del código
npm run validate
```

## 🔧 API

### Función Principal: `processContent`

```javascript
import { processContent } from './src/services/llmAdapter.js';

const inputData = {
  encabezado: "Mi título",
  material: "Mi contenido completo",
  target_platforms: ["facebook", "instagram", "linkedin"]
};

const results = await processContent(inputData);
```

### Estructura de Respuesta

```javascript
{
  "facebook": {
    "text": "Contenido adaptado para Facebook...",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "character_count": 156,
    "tone": "Conversacional y cercano"
  },
  "instagram": {
    "text": "Contenido adaptado para Instagram...",
    "hashtags": ["#hashtag1", "#hashtag2"], 
    "character_count": 161,
    "tone": "Inspirador y visual",
    "suggested_image_prompt": "Descripción de imagen sugerida..."
  }
  // ... más plataformas
}
```

## 🧪 Pruebas

El proyecto incluye una suite completa de pruebas usando Jest:

```bash
# Ejecutar todas las pruebas
npm test

# Ver cobertura
npm run test:coverage

# Modo interactivo
npm run test:watch
```

### Casos de Prueba Incluidos

- ✅ Validación de entrada
- ✅ Transformación por plataforma
- ✅ Manejo de errores
- ✅ Integración con OpenAI
- ✅ Formato de salida
- ✅ Límites de caracteres

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **OpenAI API** - Modelo de IA para transformación
- **Chalk** - Colores en terminal
- **Readline** - Interfaz interactiva
- **Jest** - Framework de pruebas
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

