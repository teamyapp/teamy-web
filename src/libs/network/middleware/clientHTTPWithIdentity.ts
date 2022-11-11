import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { getAccessToken } from '@lib/identity/Identity.client';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPResponse } from '../HTTP.client';

export const clientHTTPWithIdentity: Middleware<HTTPClient> = (
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
            context?: Record<string, string>,
        ): Promise<Result<HTTPResponse, InternalError>> => {
            const method = options?.method || 'GET';
            const headers = {
                ...options?.headers,
                Authorization: `Bearer ${getAccessToken()}`,
            };
            return httpClient.request(
                url,
                {
                    ...options,
                    method,
                    headers,
                },
                context,
            );
        },
    };
};
