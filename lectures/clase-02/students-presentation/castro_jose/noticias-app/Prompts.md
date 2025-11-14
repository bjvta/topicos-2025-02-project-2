## ¿Qué problema resolvemos?
Necesitamos transformar un boletín base (`titulo` + `contenido`) en versiones listas para publicar en distintas redes sociales de la Facultad de Ciencias de la Computación y Telecomunicaciones (UAGRM). Cada red demanda tono, longitud, número de hashtags y llamadas a la acción diferentes, por lo que generamos prompts dinámicos que instruyen al modelo para devolver un JSON con el texto adaptado y metadatos auxiliares.

## Flujo de generación
1. El endpoint `POST /adaptation` recibe un `AdaptContentRequestDto` con la noticia original y las redes destino.
2. `ContentAdaptationService` itera las redes y delega a `PromptBuilder` (`src/adaptation/prompts/prompt-builder.ts`) la construcción del prompt.
3. El builder obtiene la configuración de cada red desde `NETWORK_CONFIGS` (`src/adaptation/constants/network-config.ts`) y ensambla el siguiente bloque textual:
   - *Sistema y contexto*: fija al modelo como experto en marketing de la UAGRM e incluye temáticas frecuentes para anclar la voz institucional.
   - *Parámetros específicos*: inserta dinámicamente el nombre de la red, máximo de caracteres, tono, uso recomendado de hashtags/emojis y la “persona” que debe representar la respuesta.
   - *Notas operativas*: carga el array `notes` del network para remarcar énfasis comunicacional (ej. recordar mencionar a la Facultad, iniciar con hook TikTok, etc.).
   - *Tarea y restricciones*: ordena transformar el contenido sin inventar datos, mantener la voz institucional, mencionar a la UAGRM cuando aplique y calcular `character_count`.
   - *Entrada estructurada*: vuelca `titulo` y `contenido` originales.
   - *Salida obligatoria*: especifica un JSON estricto con los campos descritos en `outputFields` (por ejemplo `text`, `hashtags`, `tone`, `suggested_image_prompt`, etc.). También muestra un ejemplo con tipos adecuados (número, string o arreglo).
4. El texto resultante y el nombre de la red se envían al `ContentAdapter` (Ollama o mock), que ejecuta el modelo y retorna un objeto con los campos solicitados.

## Plantilla base del prompt (`PromptBuilder.buildPrompt`)
Este es el contenido literal que enviamos al LLM, con valores interpolados según la red:
```
Sistema: Eres un experto en marketing de redes sociales especializado en <displayName>.
Contexto: Comunicas informacion oficial de la Facultad de Ciencias de la Computacion y Telecomunicaciones de la UAGRM (Santa Cruz, Bolivia).
Tematicas frecuentes: retiro o adicion de materias, casos especiales, inicio de inscripciones, calendario academico, noticias internas, pasantias, talleres, seminarios, cursos y ferias.
Caracteristicas de <displayName>:
- Maximo de caracteres: <maxCharacters>
- Tono: <tone>
- Uso de hashtags: <hashtagUsage>
- Uso de emojis: <emojiUsage>
- Rol/Persona: <personaHint>
- Nota: <notes[0]>
- Nota: <notes[1]>
...
Tarea: Transforma el contenido respetando la audiencia de este canal y manteniendo la voz institucional de la UAGRM.
Requisitos adicionales:
- No inventes datos que no aparezcan en el contenido original.
- Menciona la UAGRM o la Facultad cuando sea relevante para reforzar el caracter oficial.
- No incluyas notas para humanos ni explicaciones fuera del JSON.
- Calcula el campo "character_count" con el numero real de caracteres del texto final.
Entrada:
titulo: <payload.titulo>
contenido: <payload.contenido>
Formato de salida JSON estricto (usa comillas dobles y valores finales):
{
  "<outputFields[0].key>": <valor segun tipo>,
  "<outputFields[1].key>": <valor segun tipo>,
  ...
}
```
- `<displayName>`, límites, tono, notas y campos provienen de `NETWORK_CONFIGS[network]`, por lo que Facebook, Instagram, LinkedIn, TikTok y WhatsApp reciben instrucciones particulares.
- `PromptBuilder.buildOutputExample` imprime un JSON de ejemplo con tipos correctos (número, string o arreglo) para reforzar el formato esperado.
- `ContentAdaptationService.normalizeResult` aplica defaults (`tone`, `format`, `suggested_image_prompt`, `video_hook`) y recalcula `character_count` si el modelo omite alguno.

## Detalle por red (`NETWORK_CONFIGS`)
- **Facebook**: 300 caracteres, tono informativo y cercano, 1-2 hashtags opcionales, emojis moderados y persona tipo community manager. Notas recalcan aclarar rápidamente la temática (retiros, inscripciones, etc.), mencionar a la UAGRM y animar a comentar.
- **Instagram**: 2200 caracteres, tono entusiasta, uso alto de emojis y muchos hashtags; se pide storytelling visual, indicar audiencia objetivo y sugerir imagen/clip ideal. CTA debe invitar a guardar, compartir o etiquetar.
- **LinkedIn**: 700 caracteres, tono profesional, 2-3 hashtags y uso mínimo de emojis. Busca resaltar logros académicos o alianzas y siempre nombrar a la Facultad/UAGRM. El cierre debe invitar a contactar o seguir la página.
- **TikTok**: 150 caracteres, tono juvenil y energético, 3 hashtags mezclando tendencias. Hook inicial estilo “Veci, ya viste...?”, frases cortas aptas para captions y CTA juvenil (“etiqueta a tu pana”).
- **WhatsApp**: 500 caracteres, tono conversacional con emojis ligeros y sin hashtags. El mensaje saluda a nombre de la Facultad, explica pasos/fechas clave y cierra invitando a responder dudas.

## Beneficios de esta estrategia
- Asegura consistencia: todas las redes reciben instrucciones comunes más reglas particulares derivadas de `NETWORK_CONFIGS`.
- Facilita validación: al exigir JSON estricto y recalcular `character_count`, podemos normalizar la respuesta antes de devolverla al cliente.
- Evita alucinaciones: recordatorios explícitos de no inventar datos ni incluir notas para humanos reducen respuestas fuera de contexto.
- Ajusta entregables: campos opcionales como `suggested_image_prompt`, `video_hook` o `format` solo se piden en redes que los necesitan, lo cual optimiza el prompt y las verificaciones posteriores.
