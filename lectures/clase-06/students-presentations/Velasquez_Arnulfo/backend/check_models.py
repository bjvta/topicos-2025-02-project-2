import google.generativeai as genai
import os
from dotenv import load_dotenv

# Carga la clave API desde tu archivo .env
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("Error: No se pudo encontrar la GEMINI_API_KEY en tu archivo .env")
    print("Asegúrate de que el archivo .env esté en la misma carpeta que este script.")
else:
    try:
        # Configura la API con tu clave
        genai.configure(api_key=api_key)

        print("--- Conectado con éxito a la API de Google ---")
        print("Buscando modelos que soporten 'generateContent' para tu clave:\n")

        modelos_encontrados = 0

        # Pide a Google la lista de todos los modelos disponibles
        for m in genai.list_models():
            # Filtramos solo los que pueden hacer lo que necesitamos ('generateContent')
            if 'generateContent' in m.supported_generation_methods:
                print(f"✅ Modelo disponible: {m.name}")
                modelos_encontrados += 1

        if modelos_encontrados == 0:
            print("\n--- No se encontraron modelos ---")
            print("Esto es extraño. Revisa que tu clave API esté correcta y tenga permisos.")
        else:
            print(f"\nEncontrados {modelos_encontrados} modelos.")
            print("Copia el nombre de uno de estos modelos (ej. 'models/gemini-pro') y pégalo en tu archivo 'llm_service.py'.")

    except Exception as e:
        print(f"\n--- ERROR AL CONECTAR ---")
        print(f"Ocurrió un error: {e}")
        print("Verifica que tu clave API sea correcta y no tenga espacios.")