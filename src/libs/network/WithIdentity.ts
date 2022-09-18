import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { getAccessToken } from '@lib/identity/Identity.client';
import { HTTPClient } from '@lib/network/HTTP.client';

export class WithIdentity implements HTTPClient {
    public constructor(private httpClient: HTTPClient) {}

    public request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
    ): Promise<Result<string, Errors>> {
        debugger
        options = Object.assign(
            {
                headers: {
                    Authorization: `Bearer ${getAccessToken()}`,
                },
            },
            options,
        );
        return this.httpClient.request(url, options);
    }
}
