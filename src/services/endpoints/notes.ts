import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  CreateNotePayload,
  NoteListResponse,
  AutoSaveNoteRequest,
  ExplainTextRequest,
  ExplainTextResponse,
  UploadFileResponse,
  SummarizeFileRequest,
  SummarizeFileResponse,
  ConvertToVectorDBRequest,
  ConvertToVectorDBResponse,
  DeleteNoteDocRequest,
  DeleteNoteResponse,
  AutoSaveNoteResponse,
  DeleteNoteDocResponse,
  UpdateNoteResponse,
  ApiResponseNoteDetail,
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
    pageNo: number,
    pageSize: number,
  ): Promise<
    AxiosResponse<{ status: number; message: string; data: NoteListResponse }>
  > => api.get(`/note/all/${setId}?pageNo=${pageNo}&pageSize=${pageSize}`),
  autoSaveNote: (
    noteId: number,
    data: AutoSaveNoteRequest,
  ): Promise<AxiosResponse<AutoSaveNoteResponse>> =>
    api.patch(`/note/save/${noteId}`, data),
  explainText: (data: ExplainTextRequest): Promise<ExplainTextResponse> =>
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
    noteDocsId: number,
    data: DeleteNoteDocRequest,
  ): Promise<AxiosResponse<DeleteNoteDocResponse>> =>
    api.delete(`/note/delete-doc/${noteDocsId}`, { data }),
};
