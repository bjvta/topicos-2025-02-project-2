import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';
import {
  ContentAdapter,
  GenerateParams,
  RawNetworkResult,
} from './content-adapter.interface';

@Injectable()
export class OllamaContentAdapter implements ContentAdapter {
  readonly name = 'ollama';
  private readonly logger = new Logger(OllamaContentAdapter.name);
  private readonly model = process.env.OLLAMA_MODEL ?? 'llama3.2';
  private readonly client = new Ollama({
    host: process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434',
  });

  async generate({ prompt }: GenerateParams): Promise<RawNetworkResult> {
    try {
      const response = await this.client.generate({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: 0.4 },
      });

      return this.parseResponse(response.response);
    } catch (error) {
      this.logger.error('Error generando contenido con Ollama', error as Error);
      throw error;
    }
  }

  private parseResponse(responseText: string): RawNetworkResult {
    const jsonPayload = this.extractJson(responseText);

    const parsed: RawNetworkResult = JSON.parse(jsonPayload);
    if (parsed.hashtags) {
      parsed.hashtags = this.normalizeHashtags(parsed.hashtags);
    }
    return parsed;
  }

  private extractJson(payload: string): string {
    const start = payload.indexOf('{');
    const end = payload.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('No se pudo identificar contenido JSON en la respuesta.');
    }

    return payload.slice(start, end + 1).trim();
  }

  private normalizeHashtags(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((tag) => this.formatHashtag(String(tag)));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => this.formatHashtag(tag));
    }

    return [];
  }

  private formatHashtag(tag: string): string {
    return tag.startsWith('#') ? tag : `#${tag}`;
  }
}
