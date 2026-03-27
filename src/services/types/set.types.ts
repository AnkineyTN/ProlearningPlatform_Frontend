export type SetData = {
  data: Array<{
    title: string;
    code: string;
    instructor: string;
    progress: number;
    duration: string;
    flashcards: number;
    tests: number;
    audio: string;
    video: string;
    lastUpdated: string;
    date: string;
  }>;
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export type SetQueryParams = {
  page: number;
  size: number;
  sort: Array<{
    property: string;
    direction: string;
  }>;
  q?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
};

export type CreateSetPayload = {
  title: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
};

export type CreateSetResponse = {
  id: string;
  title: string;
  description: string;
  privacy: string;
  numNotes: number;
};

export type UpdateSetPayload = {
  title: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
};

export type UpdateSetResponse = {
  status: string;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
    numNotes: number;
    createdAt: string;
    updatedAt: string;
  };
  metadata: Record<string, never>;
};

export type DeleteSetResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};
