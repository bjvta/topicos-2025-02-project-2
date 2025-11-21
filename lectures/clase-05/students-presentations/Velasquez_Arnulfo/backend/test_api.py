import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

def prueba_completa():
    print("--- 1. GENERANDO CONTENIDO (Simulando Frontend) ---")
    payload_adaptar = {
        "titulo": "Lanzamiento Beta v1",
        "contenido": "Estamos emocionados de anunciar que nuestra nueva plataforma de IA está lista para pruebas. Únete ahora."
    }
    
    # Llamamos al endpoint de adaptar
    resp = requests.post(f"{BASE_URL}/adaptar/", json=payload_adaptar)
    
    if resp.status_code != 201:
        print("❌ Error al adaptar:", resp.text)
        return

    data = resp.json()
    post_id = data['post_id']
    print(f"✅ Contenido generado y guardado en BD (Post ID: {post_id})")
    
    # Mostramos lo que generó para Instagram
    ig_data = data['adaptaciones']['instagram']
    print(f"   📝 Texto IG generado: {ig_data['texto'][:50]}...")
    print(f"   🆔 ID de Publicación (Draft): {ig_data['id']}")

    # --- PAUSA DRAMÁTICA ---
    print("\n--- 2. PUBLICANDO EN INSTAGRAM (Simulando Clic en 'Publicar') ---")
    
    # Usamos el ID de la publicación que acabamos de crear
    payload_publicar = {
        "publication_id": ig_data['id'],
        "image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" # Imagen de ejemplo
    }

    start_time = time.time()
    resp_pub = requests.post(f"{BASE_URL}/publicar/", json=payload_publicar)
    
    print(f"⏱️ Tiempo de respuesta: {time.time() - start_time:.2f}s")

    if resp_pub.status_code == 200:
        print("✅ ¡ÉXITO TOTAL! Respuesta del servidor:")
        print(resp_pub.json())
        print("\n👉 Revisa tu Instagram, debería haber una nueva foto.")
    else:
        print("❌ Falló la publicación:", resp_pub.text)

if __name__ == "__main__":
    prueba_completa()