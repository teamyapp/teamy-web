import { Clock } from '@lib/runtime/clock';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class Timeout implements Retry {
    constructor(
        private clock: Clock,
        private runtime: Runtime,
        private backoff: BackOff,
        private duration: number,
        private beforeRetryDelay?: () => Promise<void>,
    ) {}

    public withRetry(
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        let retries = 0;
        let err: InternalError | undefined;
        const expiredAt = this.clock.now().getTime() + this.duration;
        return new Promise(async (resolve) => {
            while (true) {
                err = await execute();
                await this.beforeRetryDelay?.call(null);
                if (err === undefined) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                this.backoff.onFailure();
                if (
                    this.clock.now().getTime() +
                        this.backoff.delay().totalMilliSeconds >=
                    expiredAt
                ) {
                    retries++;
                    break;
                }

                await this.runtime.threadSleep(this.backoff.delay());
                retries++;
            }

            resolve([retries, err]);
        });
    }
}
