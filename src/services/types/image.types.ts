export interface ImageSignatureResponse {
    status: string;
    message: string;
    data: {
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        assetId: number;
        uploadPreset: string;
    };
    metadata: Record<string, any>;
}

export interface ImageUploadFromUrlRequest {
    sourceUrl: string;
}

export interface ImageUploadFromUrlResponse {
    status: string;
    message: string;
    data: {
        assetId: number;
        finalUrl: string;
    };
    metadata: Record<string, any>;
}

export interface ImageUploadCallbackRequest {
    assetId: number;
    publicId: string;
    url: string;
}

export interface ImageUploadCallbackResponse {
    status: string;
    message: string;
    data: string;
    metadata: Record<string, any>;
}