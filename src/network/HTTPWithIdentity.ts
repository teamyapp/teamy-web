import { HTTPClient } from './HTTP.client';

export class HTTPWithIdentity implements HTTPClient {
    private readonly httpClient: HTTPClient;

    constructor(httpClient: HTTPClient) {
        this.httpClient = httpClient;
    }

    public request(
        url: string,
        options?: {
            method: string;
            headers?: { [p: string]: string };
            body?: string;
        },
    ): Promise<string> {
        const headers = options?.headers || {};
        headers['Authorization'] = `Bearer ${1}`;
        return this.httpClient.request(url, options);
    }
}
