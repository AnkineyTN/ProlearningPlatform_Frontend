export type SocialItemType = 'NOTE' | 'EXAM' | 'FLASHCARD';

export type SocialNote = {
  id: number;
  setId: number;
  type: SocialItemType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  ownerName: string;
  ownerAvatar: string | null;
  numCards: number | null;
  numQuestions: number | null;
  duration: number | null;
};

export type SocialParams = {
  q: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type SocialListResponse<T extends SocialItemType> = {
  status: string;
  message: string;
  data: (Omit<SocialNote, 'type'> & { type: T })[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type TrendingPeriod = 'H24' | 'D7' | 'D30' | 'D365' | 'ALL_TIME';
export type ResourceType = 'ALL' | 'NOTE' | 'FLASHCARD' | 'EXAM';

export type TrendingResource = {
  rank: number;
  id: number;
  setId: number | null;
  type: SocialItemType;
  title: string;
  description: string;
  ownerId: number;
  ownerName: string;
  trendingScore: number;
  viewCount: number;
  sessionCount: number;
};

export type TrendingCreator = {
  rank: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  totalResources: number;
  newResourcesInPeriod: number;
};

export type TrendingTopic = {
  rank: number;
  topic: string;
  totalResources: number;
  newResourcesInPeriod: number;
};

export type TrendingParams = {
  period?: TrendingPeriod;
  top?: number;
};

export type TrendingResourceParams = TrendingParams & {
  type?: ResourceType;
};

export type TrendingApiResponse<T> = {
  code: number;
  message: string;
  data: T[];
};
