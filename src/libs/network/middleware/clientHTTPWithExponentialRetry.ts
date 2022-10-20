import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { wait } from '@lib/retry/retry';
import { ExponentialBuilder } from '@lib/retry/backoff/exponential';

import { HTTPClient } from '../HTTP.client';
import { HTTPClientMiddleware } from './middleware';

const backoff = new ExponentialBuilder().build()

export function clientHTTPWithExponentialRetry(
    maxRetries: number = 10,
): HTTPClientMiddleware {
    return (httpClient: HTTPClient): HTTPClient => {
        return {
            request: (
                url: string,
                options?: {
                    method: string;
                    headers?: Record<string, string>;
                    body?: string;
                },
            ): Promise<Result<string, Errors>> => {
                let currentRetry = 0;
                let result: Result<string, Errors>

                return new Promise(async (resolve) => {
                    while (currentRetry < maxRetries) {
                        currentRetry += 1
                        result = await httpClient.request(
                            url,
                            options,
                        );

                        const error = result[1]
                        if (error === null) {
                            backoff.onSuccess()
                            resolve(result);
                            return;
                        } 
                        
                        backoff.onFailure()
                        await wait(backoff.delay());
                    }

                    resolve(result)
                });
            },
        };
    };
}
