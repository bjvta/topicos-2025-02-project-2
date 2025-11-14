import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  AdaptContentRequestDto,
  AdaptContentResponseDto,
} from './dto/adapt-content.dto';
import { ContentAdaptationService } from './adaptation.service';

@Controller('adaptations')
export class ContentAdaptationController {
  constructor(
    private readonly contentAdaptationService: ContentAdaptationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  adapt(
    @Body() payload: AdaptContentRequestDto,
  ): Promise<AdaptContentResponseDto> {
    return this.contentAdaptationService.adaptContent(payload);
  }
}
