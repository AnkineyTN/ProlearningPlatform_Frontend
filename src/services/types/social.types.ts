export type SocialItemType = 'NOTE' | 'EXAM' | 'FLASHCARD';

export type SocialNote = {
  id: number;
  type: SocialItemType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  ownerName: string;
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
