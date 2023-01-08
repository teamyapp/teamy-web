import { InternalError } from '@lib/error/errors';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class InfiniteRetry implements Retry {
    constructor(private runtime: Runtime, private backoff: BackOff) {}

    public withRetry(
        execute: () => Promise<[InternalError, boolean] | undefined>,
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

                if (err[1]) {
                    resolve([retries, err[0]]);
                    return;
                }

                this.backoff.onFailure();
                await this.runtime.threadSleep(this.backoff.delay());
                retries++;
            }
        });
    }
}
