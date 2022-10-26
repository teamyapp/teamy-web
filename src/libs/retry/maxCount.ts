import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class MaxCount implements Retry {
    constructor(
        private runtime: Runtime,
        private backoff: BackOff,
        private maxCount: number,
    ) {}

    public withRetry(
        execute: () => Promise<Error | undefined>,
    ): Promise<[number, Error | undefined]> {
        let retries = 0;
        let err: Error | undefined;
        return new Promise(async (resolve) => {
            while (retries < this.maxCount) {
                err = await execute();
                if (err === undefined) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
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
