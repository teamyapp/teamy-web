import { v4 as uuidv4 } from 'uuid';

import { CustomError } from '@lib/error/errors';
import { Result } from '@lib/error/result';

import { HTTPClient } from '../HTTP.client';
import { REQUEST_ID_HEADER } from './headers';
import { HTTPClientMiddleware } from './middleware';

export const clientHTTPWithRequestId: HTTPClientMiddleware = (
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
