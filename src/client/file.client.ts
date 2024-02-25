export class FileClient {
    private readonly cloudWebAPIEndpoint: string;   

    constructor(cloudWebAPIEndpoint: string) {
        this.cloudWebAPIEndpoint = cloudWebAPIEndpoint;
    }

    public getRemoteFileUrl(filePath: string): string {
        const encodedFilePath = encodeURIComponent(filePath);
        return `${this.cloudWebAPIEndpoint}/file/files?path=${encodedFilePath}`;
    }

    public getRemoteDownloadUrl(filePath: string): string {
        const encodedFilePath = encodeURIComponent(filePath);
        return `${this.cloudWebAPIEndpoint}/file/download?path=${encodedFilePath}`;
    }
}