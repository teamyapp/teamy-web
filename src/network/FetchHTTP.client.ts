import { Errors } from '../ext/errors';
import { Result } from '../ext/result';
import { HTTPClient } from './HTTP.client';

export class FetchHTTPClient implements HTTPClient {
    async request(
        url: string,
        options?: {
            method: string;
            headers?: { [key: string]: string };
            body?: string;
        },
    ): Promise<Result<string, Errors>> {
        return new Promise<Result<string, Errors>>((resolve) => {
            fetch(url, {
                method: options?.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: options?.headers,
                redirect: 'follow',
                body: options?.body,
            })
                .then((response) => {
                    return response.text();
                })
                .then((text) => {
                    resolve({
                        value: text,
                    });
                })
                .catch((reason) => {
                    resolve({
                        error: Errors.ServiceUnavailable,
                    });
                });
        });
    }
}
