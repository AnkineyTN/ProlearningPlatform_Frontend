export const LLM_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'groq',
] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export interface LlmConfig {
  id: number;
  displayName: string | null;
  provider: LlmProvider;
  model: string;
  apiKeyMasked: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLlmConfigData {
  provider: LlmProvider;
  model: string;
  apiKey: string;
  displayName?: string;
  setActive?: boolean;
}

export interface UpdateLlmConfigData {
  provider: LlmProvider;
  model: string;
  apiKey?: string;
  displayName?: string;
}

export interface LlmConfigListResponse {
  status: number;
  message: string;
  data: LlmConfig[];
  metadata: null;
}

export interface LlmConfigResponse {
  status: number;
  message: string;
  data: LlmConfig;
  metadata: null;
}

export interface LlmConfigDeleteResponse {
  status: number;
  message: string;
  data: null;
  metadata: null;
}
