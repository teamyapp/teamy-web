import { InternalError, ErrorCode } from '@lib/error/errors';
import { Optional } from '@lib/sugar/optional';

import { HTTPClient, HTTPResponse } from './HTTP.client';

const httpStatusCodeToErrorCode: Record<number, ErrorCode> = {
    400: 'BadRequest',
    401: 'Unauthenticated',
    404: 'NotFound',
    408: 'RequestTimeOut',
    500: 'Unhandled',
    501: 'NotImplemented',
    503: 'ServiceUnavailable',
};

export class FetchHTTPClient implements HTTPClient {
    async request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
    ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> {
        return new Promise<[Optional<HTTPResponse>, Optional<InternalError>]>((resolve) => {
            fetch(url, {
                method: options?.method,
                mode: 'cors',
                cache: 'no-cache',
                headers: options?.headers,
                redirect: 'follow',
                body: options?.body,
            })
                .then(async (response) => {
                    const headers = Object.fromEntries(
                        response.headers.entries(),
                    );

                    if (response.status >= 400) {
                        resolve([
                            {
                                body: null,
                                headers,
                                statusCode: response.status,
                            },
                            {errorCode: getErrorCode(response.status)},
                        ]);
                        return null;
                    } else {
                        resolve([
                            {
                                body: await response.text(),
                                headers,
                                statusCode: response.status,
                            },
                            undefined,
                        ]);
                    }
                })
                .catch(() => {
                    resolve([undefined, {errorCode: 'Unhandled'}]);
                });
        });
    }
}

function getErrorCode(httpStatusCode: number): ErrorCode {
    return httpStatusCodeToErrorCode[httpStatusCode] || 'Unhandled';
}