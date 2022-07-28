import { UploadSessionStatus } from '@lib/fileUpload/status';

export interface UploadSession {
    id: number;
    status: UploadSessionStatus;
    uploadedSizeInBytes: number;
    fileId: number;
    fileName: number;
    mimeType: string;
    totalSizeInBytes: number;
    totalNumOfChunks: number;
    chunkIds: number;
    nextChunkIndexToUpload: number;
    actualContentHash: number;
    expectedContentHash: string;
    createdAt: string;
    updatedAt?: string;
}
