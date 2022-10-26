import { CustomError } from '@lib/error/errors';
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
            ): Promise<Result<string, CustomError>> => {
                let result: Result<string, CustomError>;

                const execute = () =>
                    new Promise<Error | null>(async (_resolve) => {
                        result = await httpClient.request(url, options);

                        if (result[1] !== null) {
                            _resolve(result[1]);
                        } else {
                            _resolve(null);
                        }
                    });

                await retry.withRetry(execute);
                return result!;
            },
        };
    };
}
