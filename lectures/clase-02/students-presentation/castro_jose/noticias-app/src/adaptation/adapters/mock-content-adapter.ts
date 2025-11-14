import { Injectable } from '@nestjs/common';
import { NETWORK_CONFIGS } from '../constants/network-config';
import { AdaptContentRequestDto } from '../dto/adapt-content.dto';
import type {
  ContentAdapter,
  GenerateParams,
  RawNetworkResult,
} from './content-adapter.interface';
import { SocialNetwork } from '../types/social-network';

const BASE_HASHTAGS: Record<SocialNetwork, string[]> = {
  facebook: ['#UAGRM', '#FacultadComputacion'],
  instagram: ['#UAGRM', '#FICCT', '#SantaCruz'],
  linkedin: ['#UAGRM'],
  tiktok: ['#UAGRM'],
  whatsapp: [],
};

const DERIVED_HASHTAG_LIMIT: Record<SocialNetwork, number> = {
  facebook: 2,
  instagram: 3,
  linkedin: 2,
  tiktok: 2,
  whatsapp: 0,
};

@Injectable()
export class MockContentAdapter implements ContentAdapter {
  readonly name = 'mock';

  async generate({
    network,
    request,
  }: GenerateParams): Promise<RawNetworkResult> {
    const config = NETWORK_CONFIGS[network];
    const seed = this.buildSeed(network, request);
    const text = this.buildDraft(network, request, seed);
    const result: RawNetworkResult = {
      text,
      character_count: text.length,
      hashtags: this.buildHashtags(network, request),
    };

    if (config.outputFields.some((field) => field.key === 'tone')) {
      result.tone = 'professional';
    }

    if (
      config.outputFields.some(
        (field) => field.key === 'suggested_image_prompt',
      )
    ) {
      result.suggested_image_prompt = `Visual del campus UAGRM relacionado con: ${request.titulo}`;
    }

    if (config.outputFields.some((field) => field.key === 'video_hook')) {
      result.video_hook = this.buildVideoHook(request, seed);
    }

    if (config.outputFields.some((field) => field.key === 'format')) {
      result.format = 'conversational';
    }

    return result;
  }

  private buildDraft(
    network: SocialNetwork,
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    switch (network) {
      case 'facebook':
        return this.buildFacebookCopy(request, seed);
      case 'instagram':
        return this.buildInstagramCopy(request, seed);
      case 'linkedin':
        return this.buildLinkedinCopy(request, seed);
      case 'tiktok':
        return this.buildTiktokCopy(request, seed);
      case 'whatsapp':
        return this.buildWhatsappStatus(request, seed);
      default:
        return `${request.titulo}. ${this.summarize(request.contenido, 240)}`;
    }
  }

  private buildFacebookCopy(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const summary = this.summarize(request.contenido, 220);
    const intros = [
      `📢 ${request.titulo} | Facultad UAGRM`,
      `ℹ️ ${request.titulo} - Computacion y Telecomunicaciones UAGRM`,
      `🎓 UAGRM informa: ${request.titulo}`,
    ];
    const callouts = [
      'Aplica para estudiantes de computacion y telecomunicaciones.',
      'Aviso oficial para quienes siguen el calendario academico.',
      'Ideal para los que gestionan materias y tramites esta semana.',
    ];
    const closings = [
      'Escribe tus dudas en los comentarios y te respondemos.',
      'Comparte la info con tu promo y evita sorpresas.',
      'Deja tu consulta aqui y el equipo academico te guia.',
    ];

    const intro = this.pickVariant(intros, `${seed}-fb-intro`);
    const callout = this.pickVariant(callouts, `${seed}-fb-callout`);
    const closing = this.pickVariant(closings, `${seed}-fb-closing`);

    return `${intro}. ${summary} ${callout} ${closing}`;
  }

  private buildInstagramCopy(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const summary = this.summarize(request.contenido, 420);
    const hooks = [
      `${request.titulo} en la Facultad de Computacion y Telecomunicaciones ✨`,
      `Vida UAGRM | ${request.titulo}`,
      `Lo nuevo en la UAGRM: ${request.titulo}`,
    ];
    const ctas = [
      'Etiqueta a tu promo y guarda este post para planificar.',
      'Comparte la info con quien necesite este dato.',
      'Deja un emoji si ya estas listo y avisa a tus compas.',
    ];

    const hook = this.pickVariant(hooks, `${seed}-ig-hook`);
    const cta = this.pickVariant(ctas, `${seed}-ig-cta`);

    return `${hook}\n${summary}\n\n${cta}`;
  }

  private buildLinkedinCopy(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const summary = this.summarize(request.contenido, 520);
    const openings = [
      `${request.titulo} - Facultad de Cs. de la Computacion y Telecomunicaciones UAGRM.`,
      `${request.titulo} | Administracion de la Facultad UAGRM.`,
      `Facultad UAGRM informa: ${request.titulo}.`,
    ];
    const closings = [
      'Coordinemos detalles con el equipo academico de la Facultad UAGRM.',
      'Invitamos a la comunidad TIC a seguir nuestras actualizaciones.',
      'Para mas informacion contacta a la administracion de la Facultad.',
    ];

    const opening = this.pickVariant(openings, `${seed}-li-open`);
    const closing = this.pickVariant(closings, `${seed}-li-close`);

    return `${opening}\n${summary}\n${closing}`;
  }

  private buildTiktokCopy(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const summary = this.summarize(request.contenido, 90);
    const hooks = [
      `Veci, ${request.titulo} llega a la UAGRM!`,
      `Dato express: ${request.titulo} ya esta activo.`,
      `Oe, ${request.titulo} es real en la Facultad.`,
    ];
    const ctas = [
      'Etiqueta a tu pana que siempre pregunta.',
      'Comenta si ya lo sabias y comparte.',
      'Guarda este tip y avisa a tu promo.',
    ];

    const hook = this.pickVariant(hooks, `${seed}-tt-hook`);
    const cta = this.pickVariant(ctas, `${seed}-tt-cta`);

    return `${hook} ${summary} ${cta}`;
  }

  private buildWhatsappStatus(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const summary = this.summarize(request.contenido, 260);
    const headlines = [
      `Estado UAGRM: ${request.titulo}`,
      `Facultad UAGRM informa ${request.titulo}`,
      `Atencion UAGRM - ${request.titulo}`,
    ];
    const reminders = [
      'Comparte este estado para que nadie se lo pierda.',
      'Recuerda revisar el portal academico y el calendario.',
      'Si es para ti, guardalo y pasa la voz en tu grupo.',
    ];

    const headline = this.pickVariant(headlines, `${seed}-wa-head`);
    const reminder = this.pickVariant(reminders, `${seed}-wa-rem`);

    return `${headline}\n${summary}\n${reminder}`;
  }

  private buildHashtags(
    network: SocialNetwork,
    request: AdaptContentRequestDto,
  ): string[] | undefined {
    const expectsHashtags = NETWORK_CONFIGS[network].outputFields.some(
      (field) => field.key === 'hashtags',
    );
    if (!expectsHashtags) {
      return undefined;
    }

    const base = BASE_HASHTAGS[network] ?? [];
    const limit = DERIVED_HASHTAG_LIMIT[network] ?? 0;
    const cleanText = `${request.titulo} ${request.contenido}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ');

    const tokens = cleanText
      .split(/\s+/)
      .filter((word) => word.length > 3 && word.length <= 20);

    const uniqueTokens = Array.from(new Set(tokens));
    const selected = uniqueTokens
      .slice(0, limit)
      .map(this.capitalizeToken)
      .map((token) => `#${token}`);

    const hashtags = [...base, ...selected].filter(Boolean);
    return Array.from(new Set(hashtags));
  }

  private buildVideoHook(
    request: AdaptContentRequestDto,
    seed: string,
  ): string {
    const hooks = [
      `Veci, ya viste ${request.titulo}?`,
      `Dato rapido: ${request.titulo} en la UAGRM.`,
      `Ojo, ${request.titulo} ya esta disponible.`,
    ];
    return this.pickVariant(hooks, `${seed}-video-hook`);
  }

  private summarize(text: string, limit: number): string {
    const normalized = text.trim().replace(/\s+/g, ' ');
    if (normalized.length <= limit) {
      return normalized;
    }
    return `${normalized.slice(0, Math.max(0, limit - 3)).trimEnd()}...`;
  }

  private capitalizeToken(token: string): string {
    if (!token) {
      return '';
    }
    return token.charAt(0).toUpperCase() + token.slice(1);
  }

  private buildSeed(
    network: SocialNetwork,
    request: AdaptContentRequestDto,
  ): string {
    return `${network}-${request.titulo}-${request.contenido}`;
  }

  private pickVariant<T>(options: T[], seed: string): T {
    const index = Math.abs(this.hash(seed)) % options.length;
    return options[index];
  }

  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
