import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Middleware } from '@lib/middleware/middleware';
import { Retry } from '@lib/retry/retry';

import { HTTPClient } from '../HTTP.client';

export function clientHTTPWithRetry(retry: Retry): Middleware<HTTPClient> {
    return (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options,
                context = {}
            ): Promise<Result<string, InternalError>> => {
                let result: Result<string, InternalError>;
                await retry.withRetry(() =>
                new Promise<InternalError | undefined>(async (resolve) => {
                    result = await httpClient.request(url, options, context);
                    if (result[2] !== null) {
                        resolve(result[2]);
                    } else {
                        resolve(undefined);
                    }
                }));
                return result!;
            },
        };
    };
}
