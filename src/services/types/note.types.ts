export type NoteDetail = {
    id: number;
    title: string;
    description: string;
    privacy: string;
    content: any;
    noteDocs: any[];
}

export type NoteListItem = {
    id: number;
    title: string;
    description: string;
    timeAgo: string;
    privacy: string;
    created_at: string;
    updated_at: string;
}

export type NoteListResponse = {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: NoteListItem[];
}

export type CreateNotePayload = {
    title: string;
    privacy: string;
    description: string;
    setId: number;
}

export type AutoSaveNoteRequest = {
    title: string;
    content: string;
}

export type ExplainTextRequest = {
    noteId: number;
    queryText: string;
}

export type ExplainTextResponse = {
    data: {
        status: number;
        message: string;
        data: {
            queryText: string;
            answer: string;
        };
    };
}

export type NoteDetailResponse = {
    id: number;
    title: string;
    content: any;
    createdAt: string;
    updatedAt: string;
}

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
}

export type SummarizeFileRequest = {
    noteDocsId: number;
    fileUrl: string;
    extension: string;
}

export type SummarizeFileResponse = {
    status: number;
    message: string;
    data: {
        noteDocsId: number;
        summary: string;
    };
}

export type ConvertToVectorDBRequest = {
    noteDocsId: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    noteId: number;
}

export type ConvertToVectorDBResponse = {
    status: number;
    message: string;
}

export type DeleteNoteDocRequest = {
    publicId: string;
    extension: string;
}