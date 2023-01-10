import { InternalError } from '@lib/error/errors';
import { getAccessToken } from '@lib/identity/Identity.client';
import { Optional } from '@lib/sugar/optional';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPRequestOptions, HTTPResponse } from '../HTTP.client';

export const clientHTTPWithIdentity: Middleware<HTTPClient> = (
    httpClient: HTTPClient,
): HTTPClient => {
    return {
        request: (
            url: string,
            options?: HTTPRequestOptions,
            context?: Record<string, string>,
        ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> => {
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
