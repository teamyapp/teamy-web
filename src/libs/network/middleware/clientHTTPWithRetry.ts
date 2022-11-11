import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Middleware } from '@lib/middleware/middleware';
import { Retry } from '@lib/retry/retry';

import { HTTPClient, HTTPResponse } from '../HTTP.client';

export function clientHTTPWithRetry(retry: Retry): Middleware<HTTPClient> {
    return (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options?: {
                    method: string;
                    headers?: Record<string, string>;
                    body?: string;
                },
                context?: Record<string, string>,
            ): Promise<Result<HTTPResponse, InternalError>> => {
                let result: Result<HTTPResponse, InternalError>;
                await retry.withRetry(
                    () =>
                        new Promise<InternalError | undefined>(
                            async (resolve) => {
                                result = await httpClient.request(
                                    url,
                                    options,
                                    context,
                                );
                                if (result[1] !== null) {
                                    resolve(result[1]);
                                } else {
                                    resolve(undefined);
                                }
                            },
                        ),
                );
                return result!;
            },
        };
    };
}
