---
marp: true
theme: gaia
size: 16:9
paginate: true
---

# Sistema de Publicaciones Multi-Plataforma
Automatización de contenido para WhatsApp y TikTok
Facultad de Ciencias de la Computación

---

## 📋 Arquitectura del Sistema

El sistema automatiza publicaciones en **2 plataformas**:

1. **WhatsApp** - Twilio API
2. **TikTok** - TikTok API v2 (Node.js) --> ( ya pasado a python, nodejs era solo apra pruebas)

Cada módulo maneja autenticación, validación y publicación de forma independiente.

---

## 💬 Módulo 1: WhatsApp - Configuración
```python
class WhatsApp:
    def __init__(self):
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        sandbox_number = os.getenv('TWILIO_SANDBOX_NUMBER')
        
        if not account_sid or not auth_token or not sandbox_number:
            raise ValueError("Faltan variables de entorno de Twilio")
        
        self.client = Client(account_sid, auth_token)
        self.from_number = f"whatsapp:{sandbox_number}"
```

**Variables requeridas:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_SANDBOX_NUMBER`

---

## 💬 WhatsApp - Enviar Mensaje
```python
def send_message(self, to_number, message_body):
    try:
        # Validación
        if not to_number or not message_body:
            return jsonify({'error': 'Faltan campos'}), 400
        
        # Agregar prefijo whatsapp: si no lo tiene
        if not to_number.startswith('whatsapp:'):
            to_number = f'whatsapp:{to_number}'
        
        # Enviar mensaje usando Twilio
        message = self.client.messages.create(
            body=message_body,
            from_=self.from_number,
            to=to_number
        )
        
        logger.info(f"✅ Mensaje enviado a {to_number}")
        return message
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500
```

---

## 🎵 Módulo 2: TikTok - Configuración (Node.js)
```javascript
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;
```

**Variables requeridas:**
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI`

**API:** TikTok API v2
**Lenguaje:** Node.js (Express)

---

## 🎵 TikTok - Verificación de Dominio
```javascript
// Ruta para verificar propiedad del dominio
app.get('/tiktokSTo4Zh8BLznHPQSovtA1HMDm3wsa26Af.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 
    'tiktokSTo4Zh8BLznHPQSovtA1HMDm3wsa26Af.txt'));
});
```

**Propósito:** TikTok verifica que eres dueño del dominio leyendo este archivo específico en tu servidor.

**Ubicación:** Raíz del proyecto
**Acceso:** `https://tudominio.com/tiktokSTo4Zh8BLznHPQSovtA1HMDm3wsa26Af.txt`

---

## 🎵 TikTok - OAuth Callback
```javascript
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.send("No llegó el code de TikTok.");
  }
  
  try {
    const params = qs.stringify({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });
```

**¿Qué hace?** TikTok redirige aquí después de que el usuario autorice la app.
**Recibe:** `code` en la query string
**Retorna:** `access_token` para hacer llamadas a la API

---

## 🎵 TikTok - Obtener Access Token
```javascript
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    const responseData = JSON.stringify(response.data, null, 2);
    res.send(`
      <h2>Respuesta completa de TikTok</h2>
      <pre>${responseData}</pre>

      <h3>Subir video</h3>
      <form action="/uploadVideo" method="POST" 
            enctype="multipart/form-data">
        <input type="hidden" name="access_token" 
               value="${response.data.access_token}">
        <input type="file" name="video" accept="video/*">
        <button type="submit">Subir video a TikTok</button>
      </form>
    `);
```

---

## 🎵 TikTok - Upload Video: Cálculo de Chunks
```javascript
app.post("/uploadVideo", upload.single("video"), async (req, res) => {
  const access_token = req.body.access_token;
  const videoPath = req.file.path;
  const videoStats = fs.statSync(videoPath);
  const videoSize = videoStats.size;

  let chunkSize;
  let totalChunks;
  const CHUNK_BASE_SIZE = 20 * 1024 * 1024; // 20 MiB

  if (videoSize <= 5 * 1024 * 1024) {
    // Video pequeño: 1 chunk
    chunkSize = videoSize;
    totalChunks = 1;
  } else {
    // Video grande: dividir en chunks de 20 MiB
    chunkSize = CHUNK_BASE_SIZE;
    totalChunks = Math.floor(videoSize / chunkSize);
  }

  if (totalChunks === 0 && videoSize > 0) {
    totalChunks = 1;
    chunkSize = videoSize;
  }
```

---

## 🎵 TikTok - Inicializar Subida
```javascript
  // 1️⃣ Inicializar subida en TikTok
  const initResponse = await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      post_info: {
        title: "Video subido desde mi app Node.js",
        privacy_level: "SELF_ONLY",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: chunkSize,
        total_chunk_count: totalChunks
      }
    },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  const { upload_url, publish_id } = initResponse.data.data;
```

---

## 🎵 TikTok - Subir Chunks Secuencialmente
```javascript
  // 2️⃣ Subir video por chunks con verificación
  const videoBuffer = fs.readFileSync(videoPath);
  const MAX_RETRIES = 3;
  let lastUploadedByte = -1;
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = (i === totalChunks - 1) ? videoSize : (start + chunkSize);
    const chunk = videoBuffer.slice(start, end);

    console.log(`📤 Chunk ${i + 1}/${totalChunks}:`);
    console.log(`   Range: bytes ${start}-${end - 1}/${videoSize}`);
    console.log(`   Size: ${(chunk.length / (1024 * 1024)).toFixed(2)} MB`);

    // Verificar secuencia
    if (lastUploadedByte >= 0 && start !== lastUploadedByte + 1) {
      throw new Error(`ERROR DE SECUENCIA`);
    }
```

---

## 🎵 TikTok - Reintentos por Chunk
```javascript
    let uploadSuccess = false;
    let retryCount = 0;

    while (!uploadSuccess && retryCount < MAX_RETRIES) {
      try {
        const uploadResponse = await axios.put(upload_url, chunk, {
          headers: {
            "Content-Type": "video/mp4",
            "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
            "Content-Length": chunk.length
          },
          maxBodyLength: Infinity,
          timeout: 630000, // 6 minutos
          validateStatus: (status) => {
            return status === 206 || status === 201 || status === 200;
          }
        });

        console.log(`✅ Chunk ${i + 1} subido (status: ${uploadResponse.status})`);
        lastUploadedByte = end - 1;
        uploadSuccess = true;

        if (i < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
```

---

## 🎵 TikTok - Manejo de Errores
```javascript
      } catch (chunkError) {
        retryCount++;
        const errorStatus = chunkError.response?.status;
        
        console.error(`❌ Error en chunk ${i + 1} (intento ${retryCount}):`, {
          status: errorStatus,
          statusText: chunkError.response?.statusText,
        });

        // Error 416: servidor rechazó el rango
        if (errorStatus === 416) {
          throw new Error(`El servidor solo recibió hasta anterior chunk`);
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error(`Chunk ${i + 1} falló después de ${MAX_RETRIES} intentos`);
        }

        // Backoff exponencial
        const waitTime = 2000 * retryCount; // 2s, 4s, 6s
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
```

---

## 🎵 TikTok - Respuesta Final
```javascript
  console.log(`🎉 ¡Todos los ${totalChunks} chunks subidos exitosamente!`);

  res.send(`
    <h2>✅ Video subido correctamente a TikTok</h2>
    <div style="background: #f0f0f0; padding: 20px;">
      <p><strong>🆔 Publish ID:</strong> ${publish_id}</p>
      <p><strong>📦 Tamaño:</strong> ${(videoSize / (1024 * 1024)).toFixed(2)} MB</p>
      <p><strong>🔢 Chunks:</strong> ${totalChunks}</p>
      <p><strong>📏 Tamaño de chunk:</strong> ${(chunkSize / (1024 * 1024)).toFixed(2)} MB</p>
    </div>
    <p>⏳ Tu video está siendo procesado por TikTok.</p>
  `);
} finally {
  if (fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
  }
}
```

---

## 📊 Comparación de Plataformas

| Plataforma | Lenguaje | Método Principal | Complejidad |
|------------|----------|------------------|-------------|
| WhatsApp | Python | Twilio Client | ⭐ Baja |
| TikTok | Node.js | Chunks + OAuth | ⭐⭐⭐ Alta |

---

## 🔄 Flujo de Publicación Integrado

1. **Usuario envía mensaje** → WhatsApp o TikTok
2. **Sistema procesa:**
   * WhatsApp: `send_message()` ✅
   * TikTok: `uploadVideo()` con chunks ✅
3. **Retorna respuesta** con confirmación de envío

---


---

## 🔧 Stack Tecnológico

---

# ¡Gracias!

**Repositorio:** [https://github.com/GonzaloTI/topicoscomunicado.git] /