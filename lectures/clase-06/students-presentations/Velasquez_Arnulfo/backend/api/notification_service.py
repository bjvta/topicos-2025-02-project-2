import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def notify_success(platform, post_id, api_id=None):
    """
    Notifica una publicación exitosa.
    """
    message = f"✅ ÉXITO: Publicado en {platform.upper()}"
    if api_id:
        message += f" (ID: {api_id})"
    message += f" - Post #{post_id}"
    
    logger.info(message)
    print(f"\n{message}\n")
    
    # Aquí se podría agregar envío de email, webhook, etc.
    return message

def notify_error(platform, post_id, error_message):
    """
    Notifica un error en la publicación.
    """
    message = f"❌ ERROR: Fallo en {platform.upper()} - Post #{post_id}"
    message += f"\n   Razón: {error_message}"
    
    logger.error(message)
    print(f"\n{message}\n")
    
    # Aquí se podría agregar envío de email, webhook, etc.
    return message

def notify_manual_action(platform, post_id):
    """
    Notifica que se requiere acción manual.
    """
    message = f"📋 MANUAL: {platform.upper()} requiere acción manual - Post #{post_id}"
    
    logger.warning(message)
    print(f"\n{message}\n")
    
    return message

def log_api_call(platform, endpoint, status_code, response_data=None):
    """
    Registra detalles de llamadas a APIs externas.
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_message = f"[{timestamp}] API Call - {platform.upper()} - {endpoint} - Status: {status_code}"
    
    if response_data:
        log_message += f"\n   Response: {str(response_data)[:200]}"
    
    logger.info(log_message)
    
    return log_message
