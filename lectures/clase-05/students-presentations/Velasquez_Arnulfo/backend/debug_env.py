import os
from dotenv import load_dotenv

# Intentamos cargar el entorno
load_dotenv()

print("-" * 30)
print("DIAGNÓSTICO DE VARIABLES DE ENTORNO")
print("-" * 30)

# 1. Verificamos FACEBOOK
fb_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
fb_page = os.getenv('FACEBOOK_PAGE_ID')

if fb_token:
    print(f"✅ FACEBOOK_ACCESS_TOKEN: Encontrado (Empieza con: {fb_token[:10]}...)")
else:
    print("❌ FACEBOOK_ACCESS_TOKEN: NO DETECTADO (Es None o vacío)")

if fb_page:
    print(f"✅ FACEBOOK_PAGE_ID: Encontrado ({fb_page})")
else:
    print("❌ FACEBOOK_PAGE_ID: NO DETECTADO")

print("-" * 30)