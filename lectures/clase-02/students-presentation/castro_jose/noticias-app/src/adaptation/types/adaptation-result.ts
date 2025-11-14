import { SocialNetwork } from './social-network';

export interface NetworkResult {
  text: string;
  hashtags?: string[];
  character_count: number;
  tone?: string;
  suggested_image_prompt?: string;
  video_hook?: string;
  format?: string;
}

export type AdaptationResponse = Partial<Record<SocialNetwork, NetworkResult>>;
