import { HTTPClient } from './HTTP.client';

export class FetchHTTPClient implements HTTPClient {
    async request(
        url: string,
        options?: {
            method: string;
            headers?: { [key: string]: string };
            body?: string;
        },
    ): Promise<string> {
        console.log(url);
        const response = await fetch(url, {
            method: options?.method,
            mode: 'cors',
            cache: 'no-cache',
            headers: options?.headers,
            redirect: 'follow',
            body: options?.body,
        });
        return response.text();
    }
}
