import { NetworkResult } from '../types/adaptation-result';
import { SocialNetwork } from '../types/social-network';

type FieldType = 'string' | 'number' | 'string_array';

export type OutputFieldKey = keyof NetworkResult;

export interface OutputFieldConfig {
  key: OutputFieldKey;
  type: FieldType;
  description: string;
}

export interface NetworkPromptConfig {
  displayName: string;
  maxCharacters: number;
  tone: string;
  hashtagUsage: string;
  emojiUsage: string;
  personaHint: string;
  notes: string[];
  outputFields: OutputFieldConfig[];
}

export const NETWORK_CONFIGS: Record<SocialNetwork, NetworkPromptConfig> = {
  facebook: {
    displayName: 'Facebook',
    maxCharacters: 300,
    tone: 'informativo y cercano',
    hashtagUsage: 'menciona 1-2 hashtags solo si suman claridad',
    emojiUsage: 'moderado, usa emojis ligados a campus o servicios',
    personaHint:
      'Community manager de la Facultad de Cs. de la Computacion y Telecomunicaciones (UAGRM) conversando con estudiantes y docentes.',
    notes: [
      'Aclara rapidamente si se trata de retiro/adicion de materias, inscripciones, pasantias, talleres o noticias de la facultad.',
      'Nombra a la UAGRM o a la Facultad para reforzar que es un anuncio oficial.',
      'Invita a dejar consultas en comentarios usando un tono amistoso propio de Santa Cruz.',
    ],
    outputFields: [
      {
        key: 'text',
        type: 'string',
        description: 'Post completo optimizado para Facebook.',
      },
      {
        key: 'hashtags',
        type: 'string_array',
        description: 'Lista opcional de hashtags relevantes.',
      },
      {
        key: 'character_count',
        type: 'number',
        description: 'Numero total de caracteres del texto.',
      },
    ],
  },
  instagram: {
    displayName: 'Instagram',
    maxCharacters: 2200,
    tone: 'entusiasta y visual',
    hashtagUsage: 'muchos hashtags que conecten con vida universitaria cruceña',
    emojiUsage: 'alto pero con storytelling natural',
    personaHint:
      'Content creator de la UAGRM que muestra vida en campus, ferias, seminarios y servicios academicos.',
    notes: [
      'Indica a quien va dirigido (estudiantes nuevos, regulares, graduados).',
      'Sugiere la imagen o clip ideal: campus, aulas, feria facultativa, laboratorios, etc.',
      'Incluye CTA amistosa para guardar, compartir o etiquetar a companeros.',
    ],
    outputFields: [
      {
        key: 'text',
        type: 'string',
        description: 'Copia principal con storytelling y emojis.',
      },
      {
        key: 'hashtags',
        type: 'string_array',
        description: 'Hashtags pensados para alcance y comunidad.',
      },
      {
        key: 'character_count',
        type: 'number',
        description: 'Numero total de caracteres del texto.',
      },
      {
        key: 'suggested_image_prompt',
        type: 'string',
        description: 'Descripcion breve de la imagen ideal.',
      },
    ],
  },
  linkedin: {
    displayName: 'LinkedIn',
    maxCharacters: 700,
    tone: 'profesional y orientado a impacto',
    hashtagUsage: 'moderado (2-3 hashtags profesionales)',
    emojiUsage: 'bajo, solo si aporta claridad',
    personaHint:
      'Directora o vocero institucional que comunica hitos academicos y alianzas de la Facultad UAGRM a empresas TIC.',
    notes: [
      'Enfatiza logros academicos, oportunidades de pasantias o colaboraciones estrategicas.',
      'Menciona siempre a la Facultad de Cs. de la Computacion y Telecomunicaciones y a la UAGRM.',
      'Cierra invitando a contactar a la administracion o a seguir la pagina de la Facultad.',
    ],
    outputFields: [
      {
        key: 'text',
        type: 'string',
        description: 'Resumen ejecutivo con enfoque institucional.',
      },
      {
        key: 'hashtags',
        type: 'string_array',
        description: 'Hashtags alineados a audiencias profesionales.',
      },
      {
        key: 'character_count',
        type: 'number',
        description: 'Numero total de caracteres del texto.',
      },
      {
        key: 'tone',
        type: 'string',
        description: 'Debe indicar el tono utilizado (professional).',
      },
    ],
  },
  tiktok: {
    displayName: 'TikTok',
    maxCharacters: 150,
    tone: 'juvenil, directo y energico',
    hashtagUsage: '3 hashtags mezclando tendencias locales y temas UAGRM',
    emojiUsage: 'alto pero sin saturar',
    personaHint:
      'Estudiante embajador que comparte tips sobre tramites, becas y eventos usando expresiones crucenas.',
    notes: [
      'Arranca con un hook llamativo estilo "Veci, ya viste...?" o similar.',
      'Frases cortas aptas para texto en pantalla o voz en off.',
      'Incluye CTA juvenil: "etiqueta a tu pana", "pregunta aqui", etc.',
    ],
    outputFields: [
      {
        key: 'text',
        type: 'string',
        description: 'Caption del video con energia juvenil.',
      },
      {
        key: 'hashtags',
        type: 'string_array',
        description: 'Hashtags combinados entre tendencia y nicho.',
      },
      {
        key: 'character_count',
        type: 'number',
        description: 'Numero total de caracteres del texto.',
      },
      {
        key: 'video_hook',
        type: 'string',
        description: 'Primera frase o pregunta para el video.',
      },
    ],
  },
  whatsapp: {
    displayName: 'WhatsApp',
    maxCharacters: 500,
    tone: 'conversacional, cercano y claro',
    hashtagUsage: 'no aplica',
    emojiUsage: 'ligero',
    personaHint:
      'Asistente academico de la Facultad escribiendo a un estudiante de la UAGRM.',
    notes: [
      'Saluda indicando que escribe desde la Facultad/UAGRM.',
      'Explica los pasos o fechas clave de manera sencilla.',
      'Cierra invitando a responder ante cualquier duda.',
    ],
    outputFields: [
      {
        key: 'text',
        type: 'string',
        description: 'Mensaje listo para publicar en estado de WhatsApp.',
      },
      {
        key: 'character_count',
        type: 'number',
        description: 'Numero total de caracteres del texto.',
      },
      {
        key: 'format',
        type: 'string',
        description: 'Debe devolver el string "conversational".',
      },
    ],
  },
};
