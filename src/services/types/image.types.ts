export type ImageSignatureResponse = {
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

export type ImageUploadFromUrlRequest = {
    sourceUrl: string;
}

export type ImageUploadFromUrlResponse = {
    status: string;
    message: string;
    data: {
        assetId: number;
        finalUrl: string;
    };
    metadata: Record<string, any>;
}

export type ImageUploadCallbackRequest = {
    assetId: number;
    publicId: string;
    url: string;
}

export type ImageUploadCallbackResponse = {
    status: string;
    message: string;
    data: string;
    metadata: Record<string, any>;
}