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
} from '../types/note.types';

export const noteAPI = {
  getNoteDetail: (
    noteId: number,
  ): Promise<AxiosResponse<ApiResponseNoteDetail>> =>
    api.get(`/note/${noteId}`),
  createNote: (
    payload: CreateNotePayload,
  ): Promise<AxiosResponse<ApiResponseNoteDetail>> =>
    api.post('/note/create', payload),
  updateNote: (
    noteId: number,
    payload: Partial<CreateNotePayload>,
  ): Promise<AxiosResponse<UpdateNoteResponse>> =>
    api.patch(`/note/update/${noteId}`, payload),
  deleteNote: (noteId: number): Promise<AxiosResponse<DeleteNoteResponse>> =>
    api.delete(`/note/delete/${noteId}`),
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
    return api.get(`/note/all/${setId}?${sp.toString()}`);
  },
  autoSaveNote: (
    noteId: number,
    data: AutoSaveNoteRequest,
  ): Promise<AxiosResponse<AutoSaveNoteResponse>> =>
    api.patch(`/note/save/${noteId}`, data),
  explainText: (
    data: ExplainTextRequest,
  ): Promise<AxiosResponse<ExplainTextResponseBody>> =>
    api.post('/note/explain', data),
  uploadFile: (
    file: File,
    noteId: number,
  ): Promise<AxiosResponse<UploadFileResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/upload-file?subject=note-document&id=${noteId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },
  summarizeFile: (
    data: SummarizeFileRequest,
  ): Promise<AxiosResponse<SummarizeFileResponse>> =>
    api.post('/note/summarize', data),
  convertToVectorDB: (
    data: ConvertToVectorDBRequest,
  ): Promise<AxiosResponse<ConvertToVectorDBResponse>> =>
    api.post('/note/convert-to-vectordb', data),
  deleteNoteDoc: (
    data: DeleteNoteDocRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.delete('/note/delete-doc', { data }),

  saveImageInNote: (
    data: SaveImgInNoteRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.post('/note/save-img', data),

  saveDocumentInNote: (
    data: SaveDocInNoteRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.post('/note/save-doc', data),

  deleteImgInNote: (
    data: DeleteNoteImgRequest,
  ): Promise<AxiosResponse<ResponseDataVoid>> =>
    api.delete('/note/delete-img', { data }),
};
