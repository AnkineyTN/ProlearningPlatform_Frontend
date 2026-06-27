export type AiUsageSlot = {
  limit: number;
  used: number;
  remaining: number;
  resetTimeSeconds: number;
};

export type AiUsageData = {
  tier: 'FREE' | 'PRO';
  byokActive: boolean;
  generation: AiUsageSlot;
  interactive: AiUsageSlot;
};
