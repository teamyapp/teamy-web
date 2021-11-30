import { Errors } from '../ext/errors';
import { Result } from '../ext/result';
import { HTTPClient } from './HTTP.client';

const errors: { [httpError: number]: Errors } = {
    400: Errors.BadRequest,
    401: Errors.Unauthenticated,
    404: Errors.NotFound,
    408: Errors.RequestTimeOut,
    500: Errors.ServerInternalError,
    501: Errors.NotImplemented,
    503: Errors.ServiceUnavailable,
};

export class FetchHTTPClient implements HTTPClient {
    async request(
        url: string,
        options?: {
            method: string;
            headers?: { [key: string]: string };
            body?: string;
        },
    ): Promise<Result<string, Errors>> {
        return new Promise<Result<string, Errors>>((resolve) => {
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
                            FetchHTTPClient.getError(response.status),
                        ]);
                        return null;
                    } else {
                        resolve([await response.text(), null]);
                    }
                })
                .catch(() => {
                    resolve([null, Errors.Unknown]);
                });
        });
    }

    private static getError(httpStatusCode: number): Errors {
        return errors[httpStatusCode] || Errors.Unknown;
    }
}
