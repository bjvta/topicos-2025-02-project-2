# backend/api/llm_service.py

import google.generativeai as genai
import os
import requests
import urllib.parse
import json
from io import BytesIO
from PIL import Image
# Ya no necesitamos 'asyncio'

# --- Configuración de la API de Gemini (desde .env) ---
api_key_from_env = os.getenv('GEMINI_API_KEY')
if api_key_from_env:
    genai.configure(api_key=api_key_from_env)
else:
    print("ADVERTENCIA: GEMINI_API_KEY no encontrada en el entorno. La generación de contenido fallará.")
# --- FIN Configuración ---


def crear_prompt(titulo, contenido):
    """
    Genera el prompt para el modelo de lenguaje de Gemini, solicitando adaptaciones JSON.
    """
    return f"""
    Eres un experto en marketing de redes sociales. Tu tarea es adaptar el siguiente contenido para 5 plataformas.
    Para Instagram, también debes sugerir un prompt para una IA de generación de imágenes.
    Para TikTok, también debes sugerir un "gancho" para el video.

    Contenido Original:
    Título: "{titulo}"
    Contenido: "{contenido}"

    Debes retornar ÚNICAMENTE un objeto JSON válido, sin ningún texto antes o después. La estructura debe ser la siguiente:

    {{
      "facebook": {{
        "text": "Texto adaptado para Facebook (tono casual/informativo, máximo 500 caracteres).",
        "hashtags": ["#Innovacion", "#Tecnologia"],
        "character_count": 0
      }},
      "instagram": {{
        "text": "Texto adaptado para Instagram (tono visual/casual, máximo 200 caracteres, con emojis).",
        "hashtags": ["#Tech", "#Innovation", "#NewFeature"],
        "character_count": 0,
        "suggested_image_prompt": "Prompt para IA de imagen (ej. 'Modern tech interface, abstract lines, vibrant colors, high detail')"
      }},
      "linkedin": {{
        "text": "Texto adaptado para LinkedIn (tono profesional, máximo 600 caracteres, con estructura profesional).",
        "hashtags": ["#Technology", "#Innovation", "#Negocios"],
        "character_count": 0,
        "tone": "professional"
      }},
      "tiktok": {{
        "text": "Texto adaptado para TikTok (tono joven/trending, máximo 150 caracteres, con emojis).",
        "hashtags": ["#Tech", "#Viral", "#NewFeature"],
        "character_count": 0,
        "video_hook": "Frase corta y muy llamativa para el inicio de un video de TikTok (max 15 palabras)."
      }},
      "whatsapp": {{
        "text": "Texto adaptado para WhatsApp (tono conversacional/directo, máximo 300 caracteres, con emojis).",
        "character_count": 0,
        "format": "conversational"
      }}
    }}

    Instrucciones Adicionales:
    - Reemplaza los textos de ejemplo con el contenido real adaptado.
    - Calcula el 'character_count' real para cada texto.
    - NO incluyas '```json' ni '```' en la respuesta. Solo el JSON.
    """

# --- Las funciones de imagen y audio se quedan aquí, pero no las llamamos ---
def generar_imagen_con_pollinations(prompt_imagen: str):
    """
    Genera una URL de imagen usando la API gratuita de Pollinations.ai.
    Devuelve la URL pública directa de Pollinations.
    """
    print(f"Generando URL de imagen con Pollinations.ai para: {prompt_imagen}")
    try:
        # 1. Construir la URL (Pollinations usa GET con el prompt en la URL)
        # Es importante codificar el prompt para URL
        encoded_prompt = urllib.parse.quote(prompt_imagen)
        # Añadimos seed aleatoria para variedad y nologo para evitar marcas de agua si es posible
        # Usamos una URL absoluta directa
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?nologo=true&seed={os.urandom(2).hex()}"
        
        print(f"URL de imagen generada: {image_url}")
        
        # Devolvemos la URL directa. NO descargamos la imagen.
        return image_url

    except Exception as e:
        print(f"Error generando URL con Pollinations: {e}")
        return None

def generar_audio_con_gemini(texto: str):
    # Esta función ya no se usará por ahora
    pass
# --- Fin de funciones desactivadas ---


# Función principal VUELVE A SER SÍNCRONA (sin 'async def')
def adaptar_contenido_con_gemini(titulo: str, contenido: str):
    """
    Función principal SÍNCRONA que coordina la adaptación de texto.
    """
    if not api_key_from_env:
        return {"error": "API Key de Gemini no configurada."}

    try:
        # --- 1. Generar el texto JSON primero (siempre usa el modelo flash para esto) ---
        text_model = genai.GenerativeModel('models/gemini-flash-latest')
        
        prompt = crear_prompt(titulo, contenido)
        
        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json"
        )
        
        # Llamada síncrona (sin 'await')
        text_response = text_model.generate_content(prompt, generation_config=generation_config)
        respuesta_json = json.loads(text_response.text)

        # --- 2. GENERACIÓN DE IMAGEN (POLLINATIONS) ---
        if 'instagram' in respuesta_json and 'suggested_image_prompt' in respuesta_json['instagram']:
            image_prompt = respuesta_json['instagram']['suggested_image_prompt']
            print(f"Prompt de imagen sugerido: {image_prompt}")
            
            # Llamar a la función de Pollinations
            image_url = generar_imagen_con_pollinations(image_prompt)
            
            if image_url:
                respuesta_json['instagram']['generated_image_url'] = image_url
                print(f"Imagen generada y añadida al JSON: {image_url}")
                
                # --- NUEVO: Compartir la imagen con Facebook ---
                if 'facebook' in respuesta_json:
                    respuesta_json['facebook']['generated_image_url'] = image_url
                    print("Imagen compartida con Facebook.")

        # --- 3. GENERACIÓN DE AUDIO (DESACTIVADA) ---
        # (Sección comentada para evitar el error de cuota 429)
        # if 'tiktok' in respuesta_json and 'video_hook' in respuesta_json['tiktok']:
        #     audio_text = respuesta_json['tiktok']['video_hook']
        #     ...

        return respuesta_json

    except Exception as e:
        print(f"Error en adaptar_contenido_con_gemini: {e}")
        return {"error": f"Error al procesar la solicitud: {e}"}