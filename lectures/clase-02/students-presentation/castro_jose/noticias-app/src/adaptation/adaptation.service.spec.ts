import { Test, TestingModule } from '@nestjs/testing';
import {
  ContentAdaptationService,
  CONTENT_ADAPTER,
} from './adaptation.service';
import { PromptBuilder } from './prompts/prompt-builder';
import { MockContentAdapter } from './adapters/mock-content-adapter';

describe('ContentAdaptationService (mock adapter)', () => {
  let service: ContentAdaptationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptBuilder,
        ContentAdaptationService,
        {
          provide: CONTENT_ADAPTER,
          useClass: MockContentAdapter,
        },
      ],
    }).compile();

    service = module.get<ContentAdaptationService>(ContentAdaptationService);
  });

  it('adapta una noticia institucional para LinkedIn', async () => {
    const payload = {
      titulo: 'Resultados corporativos Q4 2025',
      contenido:
        'Compartimos los hitos clave del trimestre: expansion a dos mercados y foco en IA responsable.',
      target_networks: ['linkedin'],
    } as const;

    const response = await service.adaptContent(payload);
    expect(response.linkedin).toBeDefined();
    expect(response.linkedin?.tone).toBe('professional');
    expect(response.linkedin?.hashtags).toContain('#UAGRM');
  });

  it('adapta anuncio de producto interno para Facebook e Instagram', async () => {
    const payload = {
      titulo: 'Nueva funcionalidad de analitica en tiempo real',
      contenido:
        'La plataforma ahora detecta insights cada 5 minutos e incluye tableros personalizables.',
      target_networks: ['facebook', 'instagram'],
    } as const;

    const response = await service.adaptContent(payload);
    expect((response.facebook?.hashtags ?? []).length).toBeGreaterThan(0);
    expect((response.instagram?.hashtags ?? []).length).toBeGreaterThan(0);
    expect(response.instagram?.suggested_image_prompt).toContain('Visual del campus');
    expect(response.instagram?.character_count).toBe(
      response.instagram?.text.length,
    );
  });

  it('adapta anuncio de evento para TikTok y WhatsApp', async () => {
    const payload = {
      titulo: 'Evento de comunidad: Demo Day Latam',
      contenido:
        'Nos reunimos este jueves para mostrar proyectos, habra panel de expertos y networking.',
      target_networks: ['tiktok', 'whatsapp'],
    } as const;

    const response = await service.adaptContent(payload);
    expect(response.tiktok?.video_hook).toMatch(/Veci|Dato rapido|Ojo/);
    expect(response.whatsapp?.format).toBe('conversational');
    expect(response.whatsapp?.character_count).toBe(
      response.whatsapp?.text.length,
    );
  });
});
