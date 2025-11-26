import axios from 'src/lib/axios';
import { PostStoryDto } from './dto/post-story.dto';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

const baseUrl = 'https://gate.whapi.cloud/';

const whatsappToken = process.env.WHATSAPP_TOKEN || '';

axios.createInstance(baseUrl);

export const whatsappApi = axios.getInstance(baseUrl);

// 1. ENVIAR UN ESTADO (STORY) A WHATSAPP
export const sendStory = async (storyData: PostStoryDto) => {
  try {
    console.log('📱 [WHATSAPP] Enviando story con datos:', {
      mediaUrl: storyData.media,
      caption: storyData.caption.substring(0, 50) + '...',
      excludeContactsCount: storyData.exclude_contacts.length,
    });

    const formData = new FormData();

    formData.append('caption', storyData.caption);
    formData.append(
      'exclude_contacts',
      JSON.stringify(storyData.exclude_contacts),
    );

    if (storyData.media) {
      let fileName = storyData.media.split('/').pop();

      if (storyData.media.startsWith('dummy:///')) {
        fileName = storyData.media.replace('dummy:///', '');
      }

      if (!fileName) {
        throw new Error('No se pudo extraer el nombre del archivo de la URL');
      }

      const filePath = path.join(process.cwd(), 'uploads', 'images', fileName);

      if (fs.existsSync(filePath)) {
        console.log('📁 [WHATSAPP] Archivo encontrado:', filePath);

        let contentType = 'image/png';
        if (
          fileName.toLowerCase().endsWith('.jpg') ||
          fileName.toLowerCase().endsWith('.jpeg')
        ) {
          contentType = 'image/jpeg';
        } else if (fileName.toLowerCase().endsWith('.gif')) {
          contentType = 'image/gif';
        } else if (fileName.toLowerCase().endsWith('.webp')) {
          contentType = 'image/webp';
        }

        console.log('🖼️ [WHATSAPP] Configurando archivo:', {
          fileName,
          contentType,
          size: fs.statSync(filePath).size,
        });

        const fileStream = fs.createReadStream(filePath);
        formData.append('media', fileStream, {
          filename: fileName,
          contentType: contentType,
        });
      } else {
        throw new Error(`Archivo de imagen no encontrado: ${filePath}`);
      }
    }

    console.log('🚀 [WHATSAPP] Enviando FormData a WhatsApp API...');

    const response = await whatsappApi.post('/stories/send/media', formData, {
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        ...formData.getHeaders(),
      },
    });

    console.log('✅ [WHATSAPP] Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al enviar el estado a WhatsApp:', error);
    throw error;
  }
};
