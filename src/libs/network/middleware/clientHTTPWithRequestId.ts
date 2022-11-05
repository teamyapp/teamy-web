import { v4 as uuidv4 } from 'uuid';

import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPResponse } from '../HTTP.client';
import { REQUEST_ID_HEADER } from './headers';

export const clientHTTPWithRequestId: Middleware<HTTPClient> = (
    httpClient: HTTPClient,
): HTTPClient => {
    return {
        request: (
            url,
            options,
            context
        ): Promise<Result<HTTPResponse, InternalError>> => {
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
