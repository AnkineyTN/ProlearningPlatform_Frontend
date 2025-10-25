export interface SetData {
    data: Array<{
        title: string
        code: string
        instructor: string
        progress: number
        duration: string
        flashcards: number
        tests: number
        audio: string
        video: string
        lastUpdated: string
        date: string
    }>
    page: number
    size: number
    sort: Array<{
        property: string
        direction: string
    }>
}

export interface SetQueryParams {
    page: number
    size: number
    sort: Array<{
        property: string
        direction: string
    }>
}

export interface CreateSetPayload {
    title: string
    description: string
    privacy: 'PUBLIC' | 'PRIVATE'
}

export interface CreateSetResponse {
    id: string
    title: string
    description: string
    privacy: string
    numNotes: number
}

export interface UpdateSetPayload {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
}