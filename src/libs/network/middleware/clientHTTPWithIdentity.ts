import { CustomError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { getAccessToken } from '@lib/identity/Identity.client';

import { HTTPClient } from '../HTTP.client';
import { HTTPClientMiddleware } from './middleware';

export const clientHTTPWithIdentity: HTTPClientMiddleware = (
    httpClient: HTTPClient,
): HTTPClient => {
    return {
        request: (
            url: string,
            options?: {
                method: string;
                headers?: Record<string, string>;
                body?: string;
            },
        ): Promise<Result<string, CustomError>> => {
            const method = options?.method || 'GET';
            const headers = {
                ...options?.headers,
                Authorization: `Bearer ${getAccessToken()}`,
            };
            return httpClient.request(url, {
                ...options,
                method,
                headers,
            });
        },
    };
};
