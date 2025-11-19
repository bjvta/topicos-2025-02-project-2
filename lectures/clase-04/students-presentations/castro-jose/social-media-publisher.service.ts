import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

@Injectable()
export class SocialMediaPublisherService {
  private readonly facebookToken: string | undefined;
  private readonly facebookPageId: string | undefined;
  private readonly instagramAccountId: string | undefined;

  constructor(private configService: ConfigService) {
    this.facebookToken = this.configService.get<string>('FACEBOOK_TOKEN');
    this.facebookPageId = this.configService.get<string>('FACEBOOK_PAGE_ID');
    this.instagramAccountId = this.configService.get<string>('INSTAGRAM_ACCOUNT_ID');

    if (!this.facebookToken) {
      console.warn(' FACEBOOK_TOKEN no configurado en .env');
    }
    if (!this.facebookPageId) {
      console.warn(' FACEBOOK_PAGE_ID no configurado en .env');
    }
    if (!this.instagramAccountId) {
      console.warn(' INSTAGRAM_ACCOUNT_ID no configurado en .env');
    }
  }

  // Publicar en Facebook
  async publishToFacebook(caption: string, imageUrl: string): Promise<PublishResult> {
    try {
      console.log(' Publicando en Facebook...');

      if (!this.facebookToken || !this.facebookPageId) {
        return {
          success: false,
          platform: 'facebook',
          error: 'Token o Page ID no configurado',
        };
      }

      const formData = new URLSearchParams();
      formData.append('caption', caption);
      formData.append('access_token', this.facebookToken);
      formData.append('url', imageUrl);

      const response = await fetch(
        `https://graph.facebook.com/v24.0/${this.facebookPageId}/photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(' Error al publicar en Facebook:', data);
        return {
          success: false,
          platform: 'facebook',
          error: data.error?.message || 'Error desconocido',
        };
      }

      console.log(' Publicado en Facebook:', data.id || data.post_id);
      return {
        success: true,
        platform: 'facebook',
        postId: data.id || data.post_id,
      };
    } catch (error) {
      console.error(' Error al publicar en Facebook:', error.message);
      return {
        success: false,
        platform: 'facebook',
        error: error.message,
      };
    }
  }

  // Publicar en Instagram (2 pasos)
  async publishToInstagram(caption: string, imageUrl: string): Promise<PublishResult> {
    try {
      console.log(' Publicando en Instagram (Paso 1/2)...');

      if (!this.facebookToken || !this.instagramAccountId) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Token o Account ID no configurado',
        };
      }

      // PASO 1: Crear el contenedor de medios
      const formData1 = new URLSearchParams();
      formData1.append('caption', caption);
      formData1.append('access_token', this.facebookToken);
      formData1.append('image_url', imageUrl);

      const response1 = await fetch(
        `https://graph.facebook.com/v24.0/${this.instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData1.toString(),
        },
      );

      const data1 = await response1.json();

      if (!response1.ok) {
        console.error(' Error al crear media container en Instagram:', data1);
        return {
          success: false,
          platform: 'instagram',
          error: data1.error?.message || 'Error en paso 1',
        };
      }

      const creationId = data1.id;
      console.log(' Media container creado:', creationId);

      // PASO 2: Publicar el contenedor
      console.log(' Publicando en Instagram (Paso 2/2)...');

      const formData2 = new URLSearchParams();
      formData2.append('access_token', this.facebookToken);
      formData2.append('creation_id', creationId);

      const response2 = await fetch(
        `https://graph.facebook.com/v24.0/${this.instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData2.toString(),
        },
      );

      const data2 = await response2.json();

      if (!response2.ok) {
        console.error(' Error al publicar en Instagram:', data2);
        return {
          success: false,
          platform: 'instagram',
          error: data2.error?.message || 'Error en paso 2',
        };
      }

      console.log(' Publicado en Instagram:', data2.id);
      return {
        success: true,
        platform: 'instagram',
        postId: data2.id,
      };
    } catch (error) {
      console.error(' Error al publicar en Instagram:', error.message);
      return {
        success: false,
        platform: 'instagram',
        error: error.message,
      };
    }
  }

  // Publicar en ambas plataformas
  async publishToSocialMedia(
    platforms: string[],
    caption: string,
    imageUrl: string,
  ): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const platform of platforms) {
      if (platform === 'facebook') {
        const result = await this.publishToFacebook(caption, imageUrl);
        results.push(result);
      } else if (platform === 'instagram') {
        const result = await this.publishToInstagram(caption, imageUrl);
        results.push(result);
      }
    }

    return results;
  }
}
