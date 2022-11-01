import { InternalError, Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';

import { HTTPClient } from './HTTP.client';

const errorMap: Record<number, Errors> = {
    400: Errors.BadRequest,
    401: Errors.Unauthenticated,
    404: Errors.NotFound,
    408: Errors.RequestTimeOut,
    500: Errors.ServerInternalError,
    501: Errors.NotImplemented,
    503: Errors.ServiceUnavailable,
};

export class FetchHTTPClient implements HTTPClient {
    private static getError(httpStatusCode: number): InternalError {
        const error = errorMap[httpStatusCode] || Errors.Unknown;
        return new InternalError(error);
    }

    async request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
    ): Promise<Result<string, InternalError>> {
        return new Promise<Result<string, InternalError>>((resolve) => {
            fetch(url, {
                method: options?.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: options?.headers,
                redirect: 'follow',
                body: options?.body,
            })
                .then(async (response) => {
                    if (response.status >= 400) {
                        resolve([
                            null,
                            response.headers,
                            FetchHTTPClient.getError(response.status),
                        ]);
                        return null;
                    } else {
                        resolve([await response.text(), response.headers, null]);
                    }
                })
                .catch(() => {
                    resolve([null, null, new InternalError(Errors.Unknown)]);
                });
        });
    }
}
