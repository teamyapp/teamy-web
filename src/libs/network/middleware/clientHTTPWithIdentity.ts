import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { getAccessToken } from '@lib/identity/Identity.client';

import { HTTPClient } from '../HTTP.client';
import { Middleware } from '../../middleware/middleware';

export const clientHTTPWithIdentity: Middleware<HTTPClient> = (
    httpClient: HTTPClient,
): HTTPClient => {
    return {
        request: (
            url: string,
            options,
            context = {}
        ): Promise<Result<string, InternalError>> => {
            const method = options?.method || 'GET';
            const headers = {
                ...options?.headers,
                Authorization: `Bearer ${getAccessToken()}`,
            };
            return httpClient.request(url, {
                ...options,
                method,
                headers,
            }, context);
        },
    };
};
