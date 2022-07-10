import {HTTPClient} from '@lib/network/HTTP.client';
import {Result} from '@lib/error/result';
import {Errors} from '@lib/error/errors';
import {getAccessToken} from '@lib/identity/Identity.client';

export class WithIdentity implements HTTPClient {
    public constructor(private httpClient: HTTPClient) {
    }

    public request(url: string, options?: {
        method: string;
        headers?: { [header: string]: string };
        body?: string
    }): Promise<Result<string, Errors>> {
        options = Object.assign({
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            }
        }, options)
        return this.httpClient.request(url, options);
    }
}