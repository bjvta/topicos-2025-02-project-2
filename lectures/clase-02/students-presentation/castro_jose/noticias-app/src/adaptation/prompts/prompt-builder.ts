import { Injectable } from '@nestjs/common';
import { NETWORK_CONFIGS, NetworkPromptConfig } from '../constants/network-config';
import { AdaptContentRequestDto } from '../dto/adapt-content.dto';
import { SocialNetwork } from '../types/social-network';

@Injectable()
export class PromptBuilder {
  buildPrompt(
    network: SocialNetwork,
    payload: AdaptContentRequestDto,
  ): string {
    const config = NETWORK_CONFIGS[network];

    return [
      `Sistema: Eres un experto en marketing de redes sociales especializado en ${config.displayName}.`,
      'Contexto: Comunicas informacion oficial de la Facultad de Ciencias de la Computacion y Telecomunicaciones de la UAGRM (Santa Cruz, Bolivia).',
      'Tematicas frecuentes: retiro o adicion de materias, casos especiales, inicio de inscripciones, calendario academico, noticias internas, pasantias, talleres, seminarios, cursos y ferias.',
      `Caracteristicas de ${config.displayName}:`,
      `- Maximo de caracteres: ${config.maxCharacters}`,
      `- Tono: ${config.tone}`,
      `- Uso de hashtags: ${config.hashtagUsage}`,
      `- Uso de emojis: ${config.emojiUsage}`,
      `- Rol/Persona: ${config.personaHint}`,
      ...config.notes.map((note) => `- Nota: ${note}`),
      'Tarea: Transforma el contenido respetando la audiencia de este canal y manteniendo la voz institucional de la UAGRM.',
      'Requisitos adicionales:',
      '- No inventes datos que no aparezcan en el contenido original.',
      '- Menciona la UAGRM o la Facultad cuando sea relevante para reforzar el caracter oficial.',
      '- No incluyas notas para humanos ni explicaciones fuera del JSON.',
      '- Calcula el campo "character_count" con el numero real de caracteres del texto final.',
      'Entrada:',
      `titulo: ${payload.titulo}`,
      `contenido: ${payload.contenido}`,
      'Formato de salida JSON estricto (usa comillas dobles y valores finales):',
      this.buildOutputExample(config),
    ].join('\n');
  }

  private buildOutputExample(config: NetworkPromptConfig): string {
    const fields = config.outputFields
      .map((field) => `  "${field.key}": ${this.exampleValue(field.type)}`)
      .join(',\n');

    return `{\n${fields}\n}`;
  }

  private exampleValue(type: string): string {
    if (type === 'number') {
      return '0';
    }

    if (type === 'string_array') {
      return '["#Ejemplo"]';
    }

    return '"Texto de ejemplo"';
  }
}
