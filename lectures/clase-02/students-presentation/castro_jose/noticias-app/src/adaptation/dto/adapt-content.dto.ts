import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AdaptationResponse } from '../types/adaptation-result';
import { SOCIAL_NETWORKS, SocialNetwork } from '../types/social-network';

export class AdaptContentRequestDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  contenido!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(SOCIAL_NETWORKS, {
    each: true,
    message: `target_networks admite solo: ${SOCIAL_NETWORKS.join(', ')}`,
  })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((network: string) => network.toLowerCase().trim())
      : value,
  )
  target_networks?: SocialNetwork[];
}

export type AdaptContentResponseDto = AdaptationResponse;
