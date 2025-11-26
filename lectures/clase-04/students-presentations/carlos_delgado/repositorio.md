# Repositorio

[Repositorio al GITHUB](https://github.com/jcarlosdelgado/Social-Topicos.git)

## Descripción breve

Social-Topicos es un proyecto para generar, enriquecer y publicar contenido en redes sociales usando modelos de lenguaje y generadores de medios. Automatiza la creación de posts, generación de imágenes/videos y su publicación en plataformas como Facebook, Instagram, LinkedIn, TikTok y WhatsApp.

## Estructura principal

- `backend/`: API, servicios y scripts para generación y publicación.
- `frontend/` y `frontend_vanilla/`: interfaces de usuario (Angular y versión simple).
- `scripts/`: flujos y utilidades para generar y publicar contenido.
- `data/`: posts de ejemplo y datos generados.

## Cómo empezar (rápido)

1. Crear y activar un entorno virtual.

```bash
python -m venv .venv
# En bash en Windows (Git Bash / WSL):
source .venv/Scripts/activate
# Si usas PowerShell en Windows:
# .\.venv\Scripts\Activate.ps1
```

2. Instalar dependencias del backend.

```bash
pip install -r backend/requirements.txt
```

3. Ejecutar la aplicación (o usar los scripts de `scripts/`).

```bash
python backend/app/main.py
# o ejecutar scripts concretos, por ejemplo:
# python scripts/generate_media_demo.py
```