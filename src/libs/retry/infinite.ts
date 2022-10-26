import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class Infinite implements Retry {
    constructor(private runtime: Runtime, private backoff: BackOff) {}

    public withRetry(
        execute: () => Promise<Error | undefined>,
    ): Promise<[number, Error | undefined]> {
        let retries = 0;
        return new Promise(async (resolve) => {
            while (true) {
                retries++;
                const err = await execute();
                if (err === null) {
                    this.backoff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                this.backoff.onFailure();
                await this.runtime.threadSleep(this.backoff.delay());
            }
        });
    }
}
