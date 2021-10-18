export interface HTTPClient {
    request(
        url: string,
        options?: {
            method: string;
            headers?: { [key: string]: string };
            body?: string;
        },
    ): Promise<string>;
}
