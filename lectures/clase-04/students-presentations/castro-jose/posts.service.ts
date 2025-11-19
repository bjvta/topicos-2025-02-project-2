import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Post } from './entities/post.entity';

interface GeneratedPost {
  platform: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  imagePrompt?: string;
}

@Injectable()
export class PostsService {
  private openai: OpenAI;
  private readonly baseContext = `
Eres un asistente especializado en crear contenido para redes sociales para la Facultad de Ciencias de la Computación y Telecomunicaciones de la Universidad Autónoma Gabriel René Moreno (UAGRM).

Información de contexto:
- Universidad: Universidad Autónoma Gabriel René Moreno (UAGRM)
- Facultad: Ciencias de la Computación y Telecomunicaciones
- Ubicación: Santa Cruz de la Sierra, Bolivia
- Áreas académicas: Ingeniería de Sistemas, Ingeniería Informática, Ingeniería en Telecomunicaciones
- Enfoque: Educación superior en tecnología, innovación, desarrollo de software, redes, inteligencia artificial, ciberseguridad
`;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }

    if (apiKey.includes('_openai_api_key_here') || !apiKey.startsWith('sk-')) {
      console.warn(' ADVERTENCIA: La OPENAI_API_KEY parece ser inválida o un placeholder');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  // VALIDAR Y GENERAR TEXTOS EN 1 SOLA LLAMADA
  async validateAndGenerateTexts(message: string): Promise<{
    isValid: boolean;
    reason: string;
    posts?: Array<{ platform: string; content: string }>;
  }> {
    try {
      console.log(' [LLAMADA 1/2] Validando contenido y generando textos:', message);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente especializado de la Universidad Autónoma Gabriel René Moreno (UAGRM) y la Facultad de Ciencias de la Computación y Telecomunicaciones.

TAREA:
1. VALIDAR si el mensaje es una noticia/evento/logro relacionado con UAGRM o FCCT (actividades académicas, eventos estudiantiles, tecnología, programación, innovación).
2. Si es VÁLIDO, generar 5 posts profesionales para Instagram, Facebook, TikTok, LinkedIn y WhatsApp.

INSTRUCCIONES POR PLATAFORMA:
- Instagram: 2200 caracteres máx, emojis, 5-10 hashtags (#UAGRM #Computación #Tecnología)
- Facebook: 500 palabras, tono informativo, 3-5 hashtags
- TikTok: Script 30-60 seg, hook fuerte, lenguaje juvenil, 3-4 hashtags
- LinkedIn: 150-300 palabras, profesional, bullets points, 3-5 hashtags
- WhatsApp: 100-200 palabras, conversacional, emojis, info práctica

Responde ÚNICAMENTE con este JSON:
{
  "isValid": true/false,
  "reason": "explicación breve",
  "posts": [
    {"platform": "instagram", "content": "texto completo del post"},
    {"platform": "facebook", "content": "texto completo del post"},
    {"platform": "tiktok", "content": "script completo"},
    {"platform": "linkedin", "content": "texto completo del post"},
    {"platform": "whatsapp", "content": "mensaje completo"}
  ]
}

Si NO es válido, devuelve solo isValid:false y reason, sin posts.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      });

      const response = completion.choices[0].message.content || '{"isValid": false, "reason": "No se pudo validar"}';
      console.log(' [LLAMADA 1/2] Respuesta completa:', response.substring(0, 500) + '...');
      
      const parsed = JSON.parse(response);
      console.log('Validación:', parsed.isValid, '- Reason:', parsed.reason);
      console.log(' Posts generados:', parsed.posts ? parsed.posts.length : 0);
      
      return parsed;
    } catch (error) {
      console.error(' Error en validación y generación:', error);
      return { isValid: false, reason: 'Error al validar el contenido' };
    }
  }

  // GENERAR LOS 5 POSTS AUTOMÁTICAMENTE
  async generateAllPosts(
    message: string,
    userId: string,
    chatMessageId: string,
    preGeneratedTexts?: Array<{ platform: string; content: string }>,
  ): Promise<GeneratedPost[]> {
    const posts: GeneratedPost[] = [];

    // LLAMADA 2/2: Generar 1 sola imagen compartida para todas las plataformas (incluido TikTok)
    console.log(' [LLAMADA 2/2] Generando imagen compartida...');
    const sharedImageData = await this.generateImage(message);
    console.log(' [LLAMADA 2/2] Imagen generada:', sharedImageData.imageUrl.substring(0, 80) + '...');

    // Crear posts con textos pre-generados o generar nuevos (fallback)
    const platforms = ['instagram', 'facebook', 'tiktok', 'linkedin', 'whatsapp'];

    for (const platform of platforms) {
      // Buscar texto pre-generado o generar nuevo como fallback
      const preGenerated = preGeneratedTexts?.find((p) => p.platform === platform);
      const content = preGenerated?.content || (await this.generatePostContent(message, this.getPlatformInstructions(platform)));

      const post: GeneratedPost = {
        platform,
        content,
        imageUrl: sharedImageData.imageUrl,
        imagePrompt: sharedImageData.prompt,
      };

      // TikTok también usa la imagen compartida (no video por ahora)

      // Guardar en base de datos
      const savedPost = await this.postsRepository.save({
        prompt: message,
        platform,
        content,
        userId,
        chatMessageId,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        imagePrompt: post.imagePrompt,
      });

      post['id'] = savedPost.id;
      posts.push(post);
    }

    console.log(' Posts guardados en BD:', posts.length);
    return posts;
  }

  // Generar contenido del post
  private async generatePostContent(message: string, platformInstructions: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${this.baseContext}\n\n${platformInstructions}`,
          },
          {
            role: 'user',
            content: `Genera un post profesional sobre: ${message}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content || 'No se pudo generar el contenido';
    } catch (error) {
      console.error('Error al generar contenido:', error);
      throw new InternalServerErrorException('Error al generar contenido del post');
    }
  }

  // Generar 1 imagen compartida con DALL-E 3
  private async generateImage(message: string): Promise<{ imageUrl: string; prompt: string }> {
    try {
      const imagePrompt = `Crea una imagen profesional y atractiva para redes sociales sobre: "${message}". 
Contexto: Universidad Autónoma Gabriel René Moreno (UAGRM) - Facultad de Ciencias de la Computación y Telecomunicaciones.
Estilo: moderno, universitario, tecnológico, inspirador. 
Colores: azul (#0066CC), blanco, degradados modernos. 
Elementos: tecnología, educación, universidad, estudiantes, innovación.
Formato: Debe funcionar en Instagram, Facebook, LinkedIn y WhatsApp.
NO incluir texto en la imagen.`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });

      return {
        imageUrl: response.data?.[0]?.url || 'https://via.placeholder.com/1024x1024?text=Error+al+generar+imagen',
        prompt: imagePrompt,
      };
    } catch (error) {
      console.error(' Error al generar imagen:', error);
      return {
        imageUrl: 'https://via.placeholder.com/1024x1024?text=Error+al+generar+imagen',
        prompt: message,
      };
    }
  }

  // Instrucciones por plataforma
  private getPlatformInstructions(platform: string): string {
    const instructions = {
      instagram: `
Formato para Instagram:
- Máximo 2200 caracteres
- Usa emojis relevantes 
- Incluye 5-10 hashtags relevantes al final (#UAGRM #Computación #Tecnología #Bolivia #SantaCruz)
- Tono: Inspirador y visual
- Estructura: Hook inicial, contenido breve, call-to-action, hashtags
- La imagen se generará automáticamente
`,
      facebook: `
Formato para Facebook:
- Hasta 500 palabras
- Tono informativo y detallado
- Incluye emojis con moderación
- Estructura: Título atractivo, desarrollo completo, call-to-action
- 3-5 hashtags al final
- La imagen se generará automáticamente
`,
      tiktok: `
Formato para TikTok:
- Script breve y dinámico (30-60 segundos de lectura)
- Lenguaje juvenil y cercano
- Hook inicial MUY fuerte (primeros 3 segundos)
- Call-to-action claro
- 3-4 hashtags trending + específicos
- Incluye ideas para efectos y transiciones
- Nota: Se generará una imagen estática (video no disponible aún)
`,
      linkedin: `
Formato para LinkedIn:
- Tono profesional y educativo
- 150-300 palabras
- Enfoque en valor profesional y oportunidades académicas
- Estructura: Problema/Situación → Solución/Oportunidad → Call-to-action
- Usa bullets points para facilitar lectura
- 3-5 hashtags profesionales
- La imagen se generará automáticamente
`,
      whatsapp: `
Formato para WhatsApp:
- Mensaje conciso y directo (100-200 palabras)
- Tono conversacional y amigable
- Información clara: fecha, hora, lugar si aplica
- Usa emojis para destacar puntos importantes
- Call-to-action claro (registro, más info, contacto)
- Sin hashtags
- La imagen se generará automáticamente
`,
    };

    return instructions[platform] || instructions.instagram;
  }

  // Obtener posts de un chat específico
  async getChatPosts(chatMessageId: string, userId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { chatMessageId, userId },
      order: { createdAt: 'ASC' },
    });
  }

  // MÉTODOS LEGACY (mantener compatibilidad)
  async getPostHistory(userId: string, limit: number = 20): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPostById(id: string, userId: string): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id, userId },
    });
  }
}
