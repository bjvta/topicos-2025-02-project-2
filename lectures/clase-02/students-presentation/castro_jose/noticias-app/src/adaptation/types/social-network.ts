export type SocialNetwork =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'whatsapp';

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  'facebook',
  'instagram',
  'linkedin',
  'tiktok',
  'whatsapp',
];

export const isSocialNetwork = (value: string): value is SocialNetwork =>
  SOCIAL_NETWORKS.includes(value as SocialNetwork);
