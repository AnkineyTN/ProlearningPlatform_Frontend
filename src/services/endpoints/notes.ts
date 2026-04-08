import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  CreateNotePayload,
  GetAllNotesBySetApiResponse,
  GetAllNotesBySetQuery,
  AutoSaveNoteRequest,
  ExplainTextRequest,
  ExplainTextResponseBody,
  UploadFileResponse,
  SummarizeFileRequest,
  SummarizeFileResponse,
  ConvertToVectorDBRequest,
  ConvertToVectorDBResponse,
  DeleteNoteDocRequest,
  DeleteNoteResponse,
  AutoSaveNoteResponse,
  UpdateNoteResponse,
  ApiResponseNoteDetail,
  SaveImgInNoteRequest,
  SaveDocInNoteRequest,
  DeleteNoteImgRequest,
  ResponseDataVoid,
  NoteFileRegionCommentDto,
  CreateNoteFileRegionCommentRequest,
} from '../types/note.types';

export const noteAPI = {
  getNoteDetail: (
    setId: number,
    noteId: number,
  ): Promise<AxiosResponse<ApiResponseNoteDetail>> =>
    api.get(`/sets/${setId}/notes/${noteId}`),
  createNote: (
    setId: number,
    payload: CreateNotePayload,
  ): Promise<AxiosResponse<ApiResponseNoteDetail>> =>
    api.post(`/sets/${setId}/notes`, payload),
  updateNote: (
    setId: number,
    noteId: number,
    payload: Partial<CreateNotePayload>,
  ): Promise<AxiosResponse<UpdateNoteResponse>> =>
    api.patch(`/sets/${setId}/notes/${noteId}`, payload),
  deleteNote: (
    setId: number,
    noteId: number,
  ): Promise<AxiosResponse<DeleteNoteResponse>> =>
    api.delete(`/sets/${setId}/notes/${noteId}`),
  getAllNotesBySet: (
    setId: number,
    query: GetAllNotesBySetQuery,
  ): Promise<AxiosResponse<GetAllNotesBySetApiResponse>> => {
    const sp = new URLSearchParams();
    sp.set('page', String(query.page));
    sp.set('size', String(query.size));
    const q = query.q?.trim();
    if (q) {
      sp.set('q', q);
    }
    if (query.privacy) {
      sp.set('privacy', query.privacy);
    }
    return api.get(`/sets/${setId}/notes?${sp.toString()}`);
  },
  autoSaveNote: (
    setId: number,
    noteId: number,
    data: AutoSaveNoteRequest,
  ): Promise<AxiosResponse<AutoSaveNoteResponse>> =>
    api.patch(`/sets/${setId}/notes/${noteId}/save`, data),
  explainText: (
    setId: number,
    data: ExplainTextRequest,
  ): Promise<AxiosResponse<ExplainTextResponseBody>> =>
    api.post(`/sets/${setId}/notes/explain`, data),
  uploadFile: (
    file: File,
    setId: number,
    noteId: number,
  ): Promise<AxiosResponse<UploadFileResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/sets/${setId}/notes/upload-file?subject=note-document&id=${noteId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },
  summarizeFile: (
    setId: number,
    data: SummarizeFileRequest,
  ): Promise<AxiosResponse<SummarizeFileResponse>> =>
    api.post(`/sets/${setId}/notes/summarize`, data),
  convertToVectorDB: (
    setId: number,
    data: ConvertToVectorDBRequest,
  ): Promise<AxiosResponse<ConvertToVectorDBResponse>> =>
    api.post(`/sets/${setId}/notes/convert-to-vectordb`, data),
  deleteNoteDoc: (
    setId: number,
    data: DeleteNoteDocRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.delete(`/sets/${setId}/notes/delete-doc`, { data }),

  saveImageInNote: (
    setId: number,
    data: SaveImgInNoteRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.post(`/sets/${setId}/notes/save-img`, data),

  saveDocumentInNote: (
    setId: number,
    data: SaveDocInNoteRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.post(`/sets/${setId}/notes/save-doc`, data),

  deleteImgInNote: (
    setId: number,
    data: DeleteNoteImgRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.delete(`/sets/${setId}/notes/delete-img`, { data }),

  /** Region comments (PDF / image) — Spring path `/api/sets/{setId}/notes/...`. */
  listFileRegionComments: (
    setId: number,
    noteId: number,
    assetId?: number,
  ): Promise<
    AxiosResponse<{ status: number; message: string; data: NoteFileRegionCommentDto[] }>
  > =>
    api.get(`/sets/${setId}/notes/${noteId}/file-region-comments`, {
      params: assetId ? { assetId } : undefined,
    }),

  createFileRegionComment: (
    setId: number,
    noteId: number,
    body: CreateNoteFileRegionCommentRequest,
  ): Promise<
    AxiosResponse<{ status: number; message: string; data: NoteFileRegionCommentDto }>
  > => api.post(`/sets/${setId}/notes/${noteId}/file-region-comments`, body),

  deleteFileRegionComment: (
    setId: number,
    noteId: number,
    commentId: number,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.delete(`/sets/${setId}/notes/${noteId}/file-region-comments/${commentId}`),
};
