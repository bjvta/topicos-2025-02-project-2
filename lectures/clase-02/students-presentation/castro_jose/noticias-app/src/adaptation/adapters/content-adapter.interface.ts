import { AdaptContentRequestDto } from '../dto/adapt-content.dto';
import { NetworkResult } from '../types/adaptation-result';
import { SocialNetwork } from '../types/social-network';

export type RawNetworkResult = Partial<NetworkResult> & { text?: string };

export interface GenerateParams {
  network: SocialNetwork;
  prompt: string;
  request: AdaptContentRequestDto;
}

export interface ContentAdapter {
  generate(params: GenerateParams): Promise<RawNetworkResult>;
  readonly name: string;
}