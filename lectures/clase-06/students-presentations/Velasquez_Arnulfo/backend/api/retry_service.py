import time
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def retry_with_backoff(max_attempts=3, initial_delay=1, backoff_factor=2):
    """
    Decorador para reintentar funciones con backoff exponencial.
    
    Args:
        max_attempts: Número máximo de intentos
        initial_delay: Delay inicial en segundos
        backoff_factor: Factor de multiplicación para el delay
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    logger.info(f"Intento {attempt}/{max_attempts} para {func.__name__}")
                    result = func(*args, **kwargs)
                    
                    # Si la función retorna un dict con status 'error', reintentamos
                    if isinstance(result, dict) and result.get('status') == 'error':
                        if attempt < max_attempts:
                            logger.warning(f"Error en {func.__name__}: {result.get('message')}. Reintentando en {delay}s...")
                            time.sleep(delay)
                            delay *= backoff_factor
                            continue
                        else:
                            logger.error(f"Todos los intentos fallaron para {func.__name__}")
                            return result
                    
                    # Éxito
                    if attempt > 1:
                        logger.info(f"Éxito en {func.__name__} después de {attempt} intentos")
                    return result
                    
                except Exception as e:
                    last_exception = e
                    logger.error(f"Excepción en {func.__name__} (intento {attempt}): {str(e)}")
                    
                    if attempt < max_attempts:
                        logger.info(f"Reintentando en {delay} segundos...")
                        time.sleep(delay)
                        delay *= backoff_factor
                    else:
                        logger.error(f"Todos los intentos fallaron para {func.__name__}")
                        return {
                            "platform": getattr(func, '__name__', 'unknown'),
                            "status": "error",
                            "message": f"Error después de {max_attempts} intentos: {str(last_exception)}"
                        }
            
            return {
                "platform": getattr(func, '__name__', 'unknown'),
                "status": "error",
                "message": f"Error después de {max_attempts} intentos"
            }
        
        return wrapper
    return decorator
