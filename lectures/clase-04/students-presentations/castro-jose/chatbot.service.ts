import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Chat } from './entities/chat.entity';
import { ChatMessage, MessageRole } from './entities/chat-message.entity';
import { PostsService } from './posts.service';
import { SocialMediaPublisherService } from './social-media-publisher.service';

@Injectable()
export class ChatbotService {
  constructor(
    private postsService: PostsService,
    private socialMediaPublisher: SocialMediaPublisherService,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private chatMessagesRepository: Repository<ChatMessage>,
  ) {}

  // GESTIÓN DE CHATS
  async createChat(userId: string, title: string): Promise<Chat> {
    const chat = this.chatsRepository.create({
      userId,
      title,
    });
    return this.chatsRepository.save(chat);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.chatsRepository.find({
      where: { userId },
      order: { lastMessageAt: 'DESC' },
      relations: ['messages'],
    });
  }

  async getChatById(chatId: string, userId: string): Promise<Chat | null> {
    const chat = await this.chatsRepository.findOne({
      where: { id: chatId, userId },
      relations: ['messages'],
    });

    // Ordenar mensajes manualmente si el chat existe
    if (chat && chat.messages) {
      chat.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    return chat;
  }

  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const result = await this.chatsRepository.delete({ id: chatId, userId });
    return (result.affected ?? 0) > 0;
  }

  // ENVIAR MENSAJE Y PROCESAR
  async sendMessage(userId: string, message: string, chatId?: string): Promise<any> {
    let chat: Chat;

    // Si no hay chatId, crear uno nuevo
    if (!chatId) {
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      chat = await this.createChat(userId, title);
    } else {
      const foundChat = await this.getChatById(chatId, userId);
      if (!foundChat) {
        throw new BadRequestException('Chat no encontrado');
      }
      chat = foundChat;
    }

    // Guardar mensaje del usuario
    const userMessage = await this.chatMessagesRepository.save({
      chatId: chat.id,
      role: MessageRole.USER,
      content: message,
    });

    // Actualizar marca de tiempo del usuario
    await this.chatMessagesRepository.update(userMessage.id, {
      isNewsValidated: true,
    });

    // OPTIMIZACIÓN: Validar Y generar textos en 1 sola llamada
    const validation = await this.postsService.validateAndGenerateTexts(message);

    if (!validation.isValid) {
      // Respuesta negativa
      const assistantMessage = await this.chatMessagesRepository.save({
        chatId: chat.id,
        role: MessageRole.ASSISTANT,
        content: ` ${validation.reason}\n\nPor favor, proporciona una noticia, evento o información relacionada con la UAGRM o la Facultad de Ciencias de la Computación y Telecomunicaciones.`,
        isNewsValidated: false,
      });

      await this.chatsRepository.update(chat.id, { lastMessageAt: new Date() });

      return {
        chatId: chat.id,
        messageId: userMessage.id,
        assistantMessageId: assistantMessage.id,
        isValid: false,
        reason: validation.reason,
        message: assistantMessage.content,
        posts: [],
      };
    }

    // Generar los 5 posts automáticamente (usando textos pre-generados)
    const posts = await this.postsService.generateAllPosts(message, userId, userMessage.id, validation.posts);

    // Marcar el mensaje del usuario como validado y con posts generados
    await this.chatMessagesRepository.update(userMessage.id, {
      isNewsValidated: true,
      postsGenerated: true,
    });

    // PUBLICAR AUTOMÁTICAMENTE en Facebook e Instagram
    const publishResults: any[] = [];
    
    // Obtener el post de Facebook
    const facebookPost = posts.find(p => p.platform === 'facebook');
    if (facebookPost && facebookPost.imageUrl) {
      const result = await this.socialMediaPublisher.publishToFacebook(facebookPost.content, facebookPost.imageUrl);
      publishResults.push(result);
    }

    // Obtener el post de Instagram
    const instagramPost = posts.find(p => p.platform === 'instagram');
    if (instagramPost && instagramPost.imageUrl) {
      const result = await this.socialMediaPublisher.publishToInstagram(instagramPost.content, instagramPost.imageUrl);
      publishResults.push(result);
    }

    // Contar publicaciones exitosas
    const successfulPublishes = publishResults.filter(r => r.success).length;
    const failedPublishes = publishResults.filter(r => !r.success);

    // Crear mensaje de respuesta del asistente con información de publicación
    let responseContent = ` ¡Perfecto! He generado posts para las 5 plataformas:\n\n` +
      ` Instagram - Con imagen\n` +
      ` Facebook - Con imagen\n` +
      ` TikTok - Con imagen\n` +
      ` LinkedIn - Con imagen\n` +
      ` WhatsApp - Con imagen\n\n` +
      ` Optimización: 1 sola imagen compartida para todas las plataformas (ahorro del 75%)\n` +
      ` Llamadas API: 2 totales (validación+textos, imagen)\n\n` +
      ` Publicación automática:\n`;

    if (successfulPublishes > 0) {
      responseContent += ` ${successfulPublishes} post(s) publicado(s) exitosamente\n`;
      publishResults.forEach(result => {
        if (result.success) {
          responseContent += `   • ${result.platform}: ID ${result.postId}\n`;
        }
      });
    }

    if (failedPublishes.length > 0) {
      responseContent += `❌ ${failedPublishes.length} post(s) fallaron:\n`;
      failedPublishes.forEach(result => {
        responseContent += `   • ${result.platform}: ${result.error}\n`;
      });
    }

    const assistantMessage = await this.chatMessagesRepository.save({
      chatId: chat.id,
      role: MessageRole.ASSISTANT,
      content: responseContent,
      isNewsValidated: true,
      postsGenerated: true,
    });

    await this.chatsRepository.update(chat.id, { lastMessageAt: new Date() });

    return {
      chatId: chat.id,
      messageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
      validationResult: {
        isValid: true,
        reason: validation.reason,
      },
      posts: posts.map(p => ({
        id: p['id'],
        platform: p.platform,
        content: p.content,
        imageUrl: p.imageUrl,
        videoUrl: p.videoUrl,
        createdAt: p['createdAt'],
      })),
      publishResults: publishResults,
      message: 'Posts generados y publicados exitosamente',
    };
  }

  // Obtener posts de un chat específico
  async getChatPosts(chatMessageId: string, userId: string): Promise<Post[]> {
    return this.postsService.getChatPosts(chatMessageId, userId);
  }

  // MÉTODOS LEGACY (mantener compatibilidad)
  async getPostHistory(userId: string, limit: number = 20): Promise<Post[]> {
    return this.postsService.getPostHistory(userId, limit);
  }

  async getPostById(id: string, userId: string): Promise<Post | null> {
    return this.postsService.getPostById(id, userId);
  }
}
