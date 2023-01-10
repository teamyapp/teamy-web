import { InternalError } from '@lib/error/errors';
import { Middleware } from '@lib/middleware/middleware';
import { Retry } from '@lib/retry/retry';
import { Optional } from '@lib/sugar/optional';

import { HTTPClient, HTTPRequestOptions, HTTPResponse } from '../HTTP.client';

export function clientHTTPWithRetry(retry: Retry): Middleware<HTTPClient> {
    return (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options?: HTTPRequestOptions,
                context?: Record<string, string>,
            ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> => {
                let result: [Optional<HTTPResponse>, Optional<InternalError>];
                await retry.withRetry(
                    () =>
                        new Promise<Optional<InternalError>>(
                            async (resolve) => {
                                result = await httpClient.request(
                                    url,
                                    options,
                                    context,
                                );
                                resolve(result[1]);
                            },
                        ),
                );
                return result!;
            },
        };
    };
}