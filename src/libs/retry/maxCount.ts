import { InternalError, ERROR_CATEGORIES } from '@lib/error/errors';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class MaxCountRetry implements Retry {
    constructor(
        private runtime: Runtime,
        private backoff: BackOff,
        private maxCount: number,
    ) {}

    public withRetry(
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        return new Promise(async (resolve) => {
            let retries = 0;
            let err: InternalError | undefined;

            while (retries < this.maxCount) {
                err = await execute();
                if (err === undefined) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                const errorCategory = ERROR_CATEGORIES[err.errorCode]
                if (errorCategory === 'ClientInteraction') {
                    resolve([retries, err]);
                    return;
                }

                this.backoff.onFailure();
                await this.runtime.threadSleep(this.backoff.delay());
                retries++;
            }

            resolve([retries, err]);
        });
    }
}
