import { WhatsAppClient } from '../../../clients/whatsapp.client';
import { PostResult } from '../shared/types';
import { MetaException } from '../../../exceptions/meta.exceptions';

interface Options {
  to: string;
  templateName: string;
  languageCode: string;
}

export const sendWhatsAppTemplateUseCase = async (
  whatsapp: WhatsAppClient,
  { to, templateName, languageCode }: Options,
): Promise<PostResult> => {
  const response = await whatsapp.sendTemplateMessage({ to, templateName, languageCode });

  const messageId = response?.messages?.[0]?.id;
  if (!messageId) {
    MetaException.validation('WhatsApp message ID not returned from API');
  }

  const result: PostResult = {
    ok: true,
    platform: 'whatsapp',
    id: messageId,
    status: 'published',
  };

  return result;
};
