import { PopChannel, chan, multi } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { UploadSessionError } from '@lib/fileUpload/error';
import { Progress } from '@lib/fileUpload/progress';
import { UploadSession } from '@lib/fileUpload/uploadSession';

const bytesPerKB = 1024;
const bytesPerMB = 1024 * bytesPerKB;
const bytesPerGB = 1024 * bytesPerMB;

export class FileUploadSession {
    private readonly onNewProgressCh = chan<Progress>();
    private readonly onNewProgressMulti = multi<Progress>(this.onNewProgressCh);

    constructor(
        private cloudAPIBaseUrl: string,
        private uploadSessionId: number,
    ) {}

    public async uploadFile(
        file: File,
    ): Promise<UploadSessionError | undefined> {
        const fileDataBuffer = await readFileData(file);
        const fileHash = await sha256Hash(fileDataBuffer);
        const chunkSizeInBytes = getChunkSizeInBytes(file.size);
        const numOfChunks = Math.ceil(file.size / chunkSizeInBytes);
        const response = await fetch(
            `${this.cloudAPIBaseUrl}/file/upload-sessions/${this.uploadSessionId}/init`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    fileName: file.name,
                    mimeType: file.type,
                    expectedContentHash: fileHash,
                    totalSizeInBytes: file.size,
                    totalNumOfChunks: numOfChunks,
                }),
            },
        );
        if (response.status < 200 || response.status > 299) {
            console.log(
                `fail to initialize upload session: httpStatus=${response.status}`,
            );
            return 'failToInit';
        }

        let currChunkIndex = 0;
        while (currChunkIndex < numOfChunks) {
            console.log(
                `start uploading chunk: currChunkIndex=${currChunkIndex}`,
            );
            const chunk = fileDataBuffer.slice(
                currChunkIndex * chunkSizeInBytes,
                (currChunkIndex + 1) * chunkSizeInBytes,
            );
            const response = await fetch(
                `${this.cloudAPIBaseUrl}/file/upload-sessions/${this.uploadSessionId}/chunks/add`,
                {
                    method: 'POST',
                    body: chunk,
                },
            );
            if (response.status < 200 || response.status > 299) {
                console.log(
                    `fail to upload chunk: httpStatus=${response.status}, currChunkIndex=${currChunkIndex}`,
                );
                return 'failToUploadChunk';
            }

            const uploadSession: UploadSession = await response.json();
            this.onNewProgressCh.put({
                newBytesUploaded: chunk.byteLength,
                totalPercentage:
                    (uploadSession.uploadedSizeInBytes / file.size) * 100,
            });
            currChunkIndex = uploadSession.nextChunkIndexToUpload;
            console.log(
                `finish uploading chunk: currChunkIndex=${currChunkIndex}`,
            );
        }

        console.log(`file is fully uploaded`);
        closeIfNot(this.onNewProgressCh);
    }

    public subscribeNewProgress(): PopChannel<Progress | undefined> {
        return this.onNewProgressMulti.copy();
    }
}

function getChunkSizeInBytes(fileSizeInBytes: number): number {
    if (fileSizeInBytes < 100 * bytesPerKB) {
        return 20 * bytesPerKB;
    } else if (fileSizeInBytes < bytesPerMB) {
        return 100 * bytesPerKB;
    } else if (fileSizeInBytes < 5 * bytesPerMB) {
        return 200 * bytesPerKB;
    } else if (fileSizeInBytes < 20 * bytesPerMB) {
        return 2 * bytesPerMB;
    } else {
        return 4 * bytesPerMB;
    }
}

function readFileData(file: File): Promise<ArrayBuffer> {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = () => {
            return resolve(fileReader.result as ArrayBuffer);
        };
        fileReader.readAsArrayBuffer(file);
    });
}

async function sha256Hash(input: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', input);
    const hashArr = Array.from(new Uint8Array(hashBuffer));
    return hashArr.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
