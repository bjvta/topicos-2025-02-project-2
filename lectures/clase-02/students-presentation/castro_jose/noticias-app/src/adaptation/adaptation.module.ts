import { Module } from '@nestjs/common';
import { ContentAdaptationController } from './adaptation.controller';
import {
  ContentAdaptationService,
  CONTENT_ADAPTER,
} from './adaptation.service';
import { PromptBuilder } from './prompts/prompt-builder';
import { MockContentAdapter } from './adapters/mock-content-adapter';
import { OllamaContentAdapter } from './adapters/ollama-content-adapter';

@Module({
  controllers: [ContentAdaptationController],
  providers: [
    PromptBuilder,
    ContentAdaptationService,
    {
      provide: CONTENT_ADAPTER,
      useFactory: () => {
        const engine = (process.env.CONTENT_ENGINE ?? 'mock').toLowerCase();
        return engine === 'ollama'
          ? new OllamaContentAdapter()
          : new MockContentAdapter();
      },
    },
  ],
  exports: [ContentAdaptationService],
})
export class AdaptationModule {}
