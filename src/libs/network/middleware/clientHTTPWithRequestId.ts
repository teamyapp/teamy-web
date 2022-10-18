import { v4 as uuidv4 } from 'uuid';

import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';

import { HTTPClient } from '../HTTP.client';
import { REQUEST_ID_HEADER } from './headers';
import { Middleware } from '../../middleware/middleware';

export const clientHTTPWithRequestId: Middleware<HTTPClient> = (
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
        ): Promise<Result<string, InternalError>> => {
            const method = options?.method || 'GET';
            const headers = {
                ...options?.headers,
                [REQUEST_ID_HEADER]: uuidv4(),
            };
            return httpClient.request(url, {
                ...options,
                method,
                headers,
            });
        },
    };
};
