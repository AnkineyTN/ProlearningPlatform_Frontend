export type NoteDetail = {
  id: number;
  title: string;
  description: string;
  privacy: string;
  content: string;
  noteDocs: string[];
};

export type NoteListItem = {
  id: number;
  title: string;
  description: string;
  timeAgo: string;
  privacy: string;
  created_at: string;
  updated_at: string;
};

export type NoteListResponse = {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: NoteListItem[];
};

export type CreateNotePayload = {
  title: string;
  privacy: string;
  description: string;
  setId: number;
};

export type AutoSaveNoteRequest = {
  title: string;
  content: string;
};

export type ExplainTextRequest = {
  noteId: number;
  queryText: string;
  lang: string;
};

export type ExplainTextResponse = {
  data: {
    status: number;
    message: string;
    data: {
      queryText: string;
      answer: string;
    };
  };
};

export type NoteDetailResponse = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadFileResponse = {
  status: number;
  message: string;
  data: {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
  };
};

export type SummarizeFileRequest = {
  noteDocsId: number;
  fileUrl: string;
  extension: string;
};

export type SummarizeFileResponse = {
  status: number;
  message: string;
  data: {
    noteDocsId: number;
    summary: string;
  };
};

export type ConvertToVectorDBRequest = {
  noteDocsId: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  noteId: number;
};

export type ConvertToVectorDBResponse = {
  status: number;
  message: string;
};

export type DeleteNoteDocRequest = {
  publicId: string;
  extension: string;
};

export type DeleteNoteResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};

export type AutoSaveNoteResponse = {
  status: string;
  message: string;
  data: NoteDetail;
  metadata: Record<string, never>;
};

export type DeleteNoteDocResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};

export type UpdateNoteResponse = {
  status: string;
  message: string;
  data: NoteDetail;
  metadata: Record<string, never>;
};

export type ApiResponseNoteDetail = {
  status: number;
  message: string;
  data: NoteDetail;
};
