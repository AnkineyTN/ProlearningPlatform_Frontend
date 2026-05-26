export const SPACE_ASSET_TYPES = ['IMAGE', 'VIDEO'] as const;
export const SOUND_ASSET_TYPES = ['AUDIO'] as const;

export const ACCEPT_MAP: Record<string, string> = {
  IMAGE: 'image/*',
  VIDEO: 'video/*',
  AUDIO: 'audio/*',
};
