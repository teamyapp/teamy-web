import { Duration } from '@lib/entity/duration';
import { InternalError, ERROR_CATEGORIES } from '@lib/error/errors';
import { Clock } from '@lib/runtime/clock';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class TimeoutRetry implements Retry {
    constructor(
        private clock: Clock,
        private runtime: Runtime,
        private backoff: BackOff,
        private duration: number,
        private beforeRetryDelay?: () => Promise<void>,
        private beforeThreadSleep?: (duration?: Duration) => Promise<void>
    ) {}

    public withRetry(
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        return new Promise(async (resolve) => {
            let retries = 0;
            let err: InternalError | undefined;
            const expiredAt = this.clock.now().getTime() + this.duration;

            while (true) {
                err = await execute();
                await this.beforeRetryDelay?.call(null);
                if (err === undefined) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                retries++
                const errorCategory = ERROR_CATEGORIES[err.errorCode]
                if (errorCategory === 'ClientInteraction') {
                    await this.beforeThreadSleep?.call(null)
                    resolve([retries, err]);
                    return;
                }

                this.backoff.onFailure();
                const duration = this.backoff.delay()
                if (
                    this.clock.now().getTime() +
                    duration.totalMilliSeconds >=
                    expiredAt
                ) {
                    break;
                }

                await this.beforeThreadSleep?.call(null, duration)
                await this.runtime.threadSleep(duration);
            }

            resolve([retries, err]);
        });
    }
}
