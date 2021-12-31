import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { HTTPClient } from '@lib/network/HTTP.client';

import { IdentityClient } from './Identity.client';

export class IdentityHTTPClient implements HTTPClient {
    private readonly identityClient: IdentityClient;
    private readonly httpClient: HTTPClient;

    constructor(identityClient: IdentityClient, httpClient: HTTPClient) {
        this.identityClient = identityClient;
        this.httpClient = httpClient;
    }

    public request(
        url: string,
        options?: {
            method: string;
            headers?: { [p: string]: string };
            body?: string;
        },
    ): Promise<Result<string, Errors>> {
        const headers = options?.headers || {};
        const accessToken = this.identityClient.getAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
        return this.httpClient.request(url, options);
    }
}
