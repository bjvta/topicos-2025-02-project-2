# Desarrollo del proyecto

## ¿Qué estamos construyendo?
Una API en NestJS que toma noticias institucionales de la Facultad de Ciencias de la Computación y Telecomunicaciones (UAGRM) y genera versiones adaptadas para distintas redes sociales. Cada petición se transforma en prompts especializados, se envía a un modelo (Ollama o un mock determinista) y se devuelve un JSON por red con copys, hashtags y metadatos listos para publicar.

## Estructura principal
- `src/main.ts`: arranca la app Nest y habilita validaciones globales.
- `src/app.module.ts`: módulo raíz que importa `AdaptationModule`.
- `src/app.controller.ts` / `src/app.service.ts`: placeholders del esqueleto Nest (no contienen lógica del dominio).
- `src/adaptation`: módulo funcional con todo lo relacionado a la adaptación de contenido.

### Detalle de `src/adaptation`
- `adaptation.controller.ts`: expone `POST /adaptations`, valida el `AdaptContentRequestDto` y delega al servicio.
- `adaptation.service.ts`: orquesta el flujo. Resuelve las redes solicitadas, construye los prompts, invoca al adaptador de contenido y normaliza los resultados (hashtag formatting, conteo de caracteres, defaults de `tone`, `format`, etc.).
- `prompts/prompt-builder.ts`: arma el prompt textual combinando contexto institucional, reglas por red y formato JSON esperado.
- `constants/network-config.ts`: catálogo con las características de Facebook, Instagram, LinkedIn, TikTok y WhatsApp (tono, límite de caracteres, uso de emojis/hashtags y campos de salida).
- `dto/adapt-content.dto.ts`: DTO con validaciones para `titulo`, `contenido` y la lista opcional de redes (`target_networks`).
- `types/*`: tipados compartidos para respuestas normalizadas y definición de `SocialNetwork`.
- `adapters/`: capa que encapsula la fuente generativa.
  - `content-adapter.interface.ts`: contrato que deben implementar los adaptadores.
  - `mock-content-adapter.ts`: genera textos deterministas a partir del contenido recibido; útil para pruebas locales sin LLM.
  - `ollama-content-adapter.ts`: conecta con el servidor Ollama cuando `CONTENT_ENGINE=ollama`.

## Flujo resumido
1. Cliente invoca `POST /adaptations` con un título, contenido y redes objetivos (si se omite, se procesa el set completo).
2. `ContentAdaptationService` consulta `NETWORK_CONFIGS` para cada red, construye el prompt y llama al adaptador configurado (`mock` por defecto).
3. La respuesta se normaliza (`character_count`, hashtags con `#`, campos opcionales) y se agrega al objeto final `AdaptationResponse`.
4. El API responde con un JSON donde cada clave es el nombre de la red y su valor incluye `text`, `hashtags`, `suggested_image_prompt`, etc. según aplique.
