export type NoteDocItem = {
  assetId: number;
  fileName: string;
  fileUrl: string;
  publicId: string;
};

export type NoteDetail = {
  id: number;
  /** Present when detail comes from backend `GetDetailNoteResponseDTO` (for `/sets/{setId}/notes/...` APIs). */
  setId?: number;
  title: string;
  description: string;
  privacy: string;
  content: string;
  noteDocs: NoteDocItem[];
  /** Optional: images attached via /note/save-img (if backend returns separately from noteDocs). */
  noteImgs?: NoteDocItem[];
  /** Some APIs use this key instead of `noteImgs`. */
  noteImages?: NoteDocItem[];
};

export type NoteFileRegionCommentDto = {
  id: number;
  noteId: number;
  noteAssetId: number;
  kind: 'doc' | 'image';
  pageNumber: number;
  rectPercent: { x: number; y: number; width: number; height: number };
  content: string;
  attachmentAssetId?: number | null;
  attachmentImageUrl?: string | null;
  clientCommentId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CreateNoteFileRegionCommentRequest = {
  noteAssetId: number;
  kind: 'doc' | 'image';
  pageNumber: number;
  rectPercent: { x: number; y: number; width: number; height: number };
  /** May be empty when `attachmentAssetId` is set (image-only comment). */
  content: string;
  /** Screenshot / paste — asset from image upload flow, not linked via save-img. */
  attachmentAssetId?: number;
  clientCommentId?: string;
  /** Sent when available so the API can verify Cloudinary public id. */
  publicId?: string;
};

export type NoteListItem = {
  id: number;
  title: string;
  description: string;
  /** Not always returned by GET /note/all; UI can derive from updated_at */
  timeAgo?: string;
  privacy: string;
  created_at: string;
  updated_at: string;
};

/** Legacy nested pagination shape (some backends). */
export type NoteListResponse = {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: NoteListItem[];
};

/** Root metadata from GET /note/all/:setId (current API). */
export type NoteListApiMetadata = {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
};

/** Raw GET /note/all response: data is a note array, pagination in metadata. */
export type GetAllNotesBySetApiResponse = {
  status?: string | number;
  message?: string;
  data: NoteListItem[] | NoteListResponse;
  metadata?: NoteListApiMetadata;
};

/** Normalized list returned by useNotesBySet (matches previous NoteListResponse). */
export type NotesBySetResult = NoteListResponse;

export type GetAllNotesBySetQuery = {
  page: number;
  size: number;
  q?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
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
  language: "English" | "Vietnamese";
  note_id: number;
  query_text: string;
};

export type ExplainTextResponseBody = {
  status: number;
  message: string;
  data: {
    queryText: string;
    answer: string;
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
  language: "English" | "Vietnamese";
  limit: number;
  file_url: string;
};

export type SummarizeFileResponse = {
  status: number;
  message: string;
  data: {
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
  noteId: number;
  assetId: number;
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

export type SaveImgInNoteRequest = {
  noteId: number;
  assetId: number;
  publicId: string;
  extension: string;
  fileName?: string;
};

export type SaveDocInNoteRequest = {
  noteId: number;
  assetId: number;
  publicId: string;
  extension: string;
  fileName?: string;
};

export type DeleteNoteImgRequest = {
  noteId: number;
  publicId: string;
  extension: string;
};

export type ResponseDataVoid = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};
