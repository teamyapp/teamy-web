import { v4 as uuidv4 } from 'uuid';

import { InternalError } from '@lib/error/errors';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPRequestOptions, HTTPResponse } from '../HTTP.client';
import { REQUEST_ID_HEADER } from './headers';
import { Optional } from '@lib/sugar/optional';

export const clientHTTPWithRequestId: Middleware<HTTPClient> = (
    httpClient: HTTPClient,
): HTTPClient => {
    return {
        request: (
            url: string,
            options?: HTTPRequestOptions,
            context?: Record<string, string>,
        ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> => {
            const method = options?.method || 'GET';
            const requestId = uuidv4();
            const headers = {
                ...options?.headers,
                [REQUEST_ID_HEADER]: requestId,
            };
            return httpClient.request(
                url,
                {
                    ...options,
                    method,
                    headers,
                },
                { ...context, requestId },
            );
        },
    };
};
