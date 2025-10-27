export interface NoteDetail {
    id: number;
    title: string;
    description: string;
    privacy: string;
    content: any;
    noteDocs: any[];
}

export interface NoteListItem {
    id: number;
    title: string;
    description: string;
    timeAgo: string;
    privacy: string;
    created_at: string;
    updated_at: string;
}

export interface NoteListResponse {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: NoteListItem[];
}

export interface CreateNotePayload {
    title: string;
    privacy: string;
    description: string;
    setId: number;
}

export interface AutoSaveNoteRequest {
    title: string;
    content: string;
}

export interface ExplainTextRequest {
    noteId: number;
    queryText: string;
}

export interface ExplainTextResponse {
    data: {
        status: number;
        message: string;
        data: {
            queryText: string;
            answer: string;
        };
    };
}

export interface NoteDetailResponse {
    id: number;
    title: string;
    content: any;
    createdAt: string;
    updatedAt: string;
}

export interface UploadFileResponse {
    status: number;
    message: string;
    data: {
        id: number;
        fileName: string;
        fileUrl: string;
        extension: string;
        publicId: string;
    };
}

export interface SummarizeFileRequest {
    noteDocsId: number;
    fileUrl: string;
    extension: string;
}

export interface SummarizeFileResponse {
    status: number;
    message: string;
    data: {
        noteDocsId: number;
        summary: string;
    };
}

export interface ConvertToVectorDBRequest {
    noteDocsId: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    noteId: number;
}

export interface ConvertToVectorDBResponse {
    status: number;
    message: string;
}

export interface DeleteNoteDocRequest {
    publicId: string;
    extension: string;
}