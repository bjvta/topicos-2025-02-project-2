import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl, getWhatsAppMessagesUrl } from '../constan-url/meta.urls';
import { SendTemplateMessageDto } from './dto/whatsapp';
import {
  SendTemplateMessageRequest,
  SendMessageResponse,
} from './interfaces/whatsapp.interface';

@Injectable()
export class WhatsAppClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
    this.accessToken = this.config.get<string>('WHATSAPP_TOKEN') || '';
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.accessToken) MetaException.missingEnv('WHATSAPP_TOKEN');
    if (!this.phoneNumberId) MetaException.missingEnv('WHATSAPP_PHONE_NUMBER_ID');
  }

  async sendTemplateMessage(sendTemplateMessageDto: SendTemplateMessageDto): Promise<SendMessageResponse> {
    const url = getWhatsAppMessagesUrl(this.baseUrl, this.phoneNumberId);

    const body: SendTemplateMessageRequest = {
      messaging_product: 'whatsapp',
      to: sendTemplateMessageDto.to,
      type: 'template',
      template: {
        name: sendTemplateMessageDto.templateName,
        language: {
          code: sendTemplateMessageDto.languageCode,
        },
      },
    };

    try {
      return await this.http.postJson<SendMessageResponse>(url, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e: any) {
      MetaException.graphApi('WhatsApp Graph API error (send template)', e.body || e.message, e.status);
    }
  }

  async sendTextMessage(to: string, text: string, previewUrl: boolean = false): Promise<SendMessageResponse> {
    const url = getWhatsAppMessagesUrl(this.baseUrl, this.phoneNumberId);

    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: text,
      },
    };

    try {
      return await this.http.postJson<SendMessageResponse>(url, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e: any) {
      MetaException.graphApi('WhatsApp Graph API error (send text)', e.body || e.message, e.status);
    }
  }
}
