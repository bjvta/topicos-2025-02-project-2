import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AdaptContentRequestDto } from './dto/adapt-content.dto';
import { AdaptationResponse, NetworkResult } from './types/adaptation-result';
import { SOCIAL_NETWORKS, SocialNetwork } from './types/social-network';
import type {
  ContentAdapter,
  RawNetworkResult,
} from './adapters/content-adapter.interface';
import { PromptBuilder } from './prompts/prompt-builder';
import { NETWORK_CONFIGS } from './constants/network-config';

export const CONTENT_ADAPTER = Symbol('CONTENT_ADAPTER');

@Injectable()
export class ContentAdaptationService {
  private readonly logger = new Logger(ContentAdaptationService.name);

  constructor(
    @Inject(CONTENT_ADAPTER) 
    private readonly adapter: ContentAdapter,
    private readonly promptBuilder: PromptBuilder,
  ) { }

  async adaptContent(
    dto: AdaptContentRequestDto,
  ): Promise<AdaptationResponse> {
    const networks = this.resolveNetworks(dto.target_networks);

    const results = await Promise.all(
      networks.map(async (network) => {
        try {
          const prompt = this.promptBuilder.buildPrompt(network, dto);
          const raw = await this.adapter.generate({
            network,
            prompt,
            request: dto,
          });

          return [network, this.normalizeResult(network, raw)] as const;
        } catch (error) {
          this.logger.error(
            `No se pudo adaptar contenido para ${network}`,
            error as Error,
          );
          throw new InternalServerErrorException(
            `Error adaptando contenido para ${network}`,
          );
        }
      }),
    );

    return results.reduce<AdaptationResponse>(
      (acc, [network, value]) => ({
        ...acc,
        [network]: value,
      }),
      {},
    );
  }

  private resolveNetworks(requested?: SocialNetwork[]): SocialNetwork[] {
    if (!requested || requested.length === 0) {
      return SOCIAL_NETWORKS;
    }

    const unique = Array.from(new Set(requested)) as SocialNetwork[];
    return unique;
  }

  private normalizeResult(
    network: SocialNetwork,
    raw: RawNetworkResult,
  ): NetworkResult {
    if (!raw.text) {
      throw new InternalServerErrorException(
        `Respuesta invalida desde el adaptador ${this.adapter.name}`,
      );
    }

    const hashtags = raw.hashtags?.map((tag) =>
      tag.startsWith('#') ? tag : `#${tag}`,
    );

    const base: NetworkResult = {
      text: raw.text.trim(),
      hashtags,
      character_count: raw.text.trim().length,
      tone: raw.tone,
      suggested_image_prompt: raw.suggested_image_prompt,
      video_hook: raw.video_hook,
      format: raw.format,
    };

    const expectedFields = NETWORK_CONFIGS[network].outputFields.map(
      (field) => field.key,
    );

    if (expectedFields.includes('tone') && !base.tone) {
      base.tone = 'professional';
    }

    if (expectedFields.includes('format') && !base.format) {
      base.format = 'conversational';
    }

    if (expectedFields.includes('suggested_image_prompt') && !base.suggested_image_prompt) {
      base.suggested_image_prompt = `Visual de los modulos UAGRM inspirado en ${raw.text.slice(0, 60)}`;
    }

    if (expectedFields.includes('video_hook') && !base.video_hook) {
      base.video_hook = base.text.split('. ')[0] ?? base.text;
    }

    base.character_count = base.text.length;
    return base;
  }
}
