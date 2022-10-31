import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Retry } from '@lib/retry/retry';

import { HTTPClient } from '../HTTP.client';
import { HTTPClientMiddleware } from './middleware';

export function clientHTTPWithRetry(retry: Retry): HTTPClientMiddleware {
    return (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options,
            ): Promise<Result<string, InternalError>> => {
                let result: Result<string, InternalError>;

                await retry.withRetry(() =>
                new Promise<InternalError | undefined>(async (resolve) => {
                    result = await httpClient.request(url, options);

                    if (result[1] !== null) {
                        resolve(result[1]);
                    } else {
                        resolve(undefined);
                    }
                }));
                return result!;
            },
        };
    };
}
