import { Duration } from '@lib/entity/duration';
import { ERROR_CATEGORIES, InternalError } from '@lib/error/errors';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class InfiniteRetry implements Retry {
    constructor(
        private runtime: Runtime,
        private backoff: BackOff,
        private beforeSkipRetry?: () => Promise<void>,
    ) {}

    public withRetry(
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        return new Promise(async (resolve) => {
            let retries = 0;
            while (true) {
                const err = await execute();
                if (err === undefined) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                retries++;
                const errorCategory = ERROR_CATEGORIES[err.errorCode];
                if (errorCategory === 'ClientInteraction') {
                    await this.beforeThreadSleep?.call(null)
                    resolve([retries, err]);
                    return;
                }

                this.backoff.onFailure();
                const duration = this.backoff.delay()
                await this.beforeThreadSleep?.call(null, duration)
                await this.runtime.threadSleep(duration);
            }
        });
    }
}
