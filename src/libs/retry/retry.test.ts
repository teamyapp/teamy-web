import { InternalError } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { ExponentialBackoff } from './backoff/exponential';
import { InfiniteRetry } from './infinite';
import { MaxCountRetry } from './maxCount';
import { TimeoutRetry } from './timeout';

export interface Executable {
    count: number;
    execute: () => Promise<InternalError | undefined>;
}

describe('Retry', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executeObj: Executable;
    let backoff: BackOff;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        backoff = new ExponentialBackoff(testRandGen);
        executeObj = {
            count: 0,
            async execute() {
                return undefined
            },
        };
    });

    describe('Retry', () => {
        it('should work with maxCount', async () => {
            const maxCount = new MaxCountRetry(testRuntime, backoff, 10);
            await maxCount.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with timeout', async () => {
            const testClock = new TestClock()
            const timeout = new TimeoutRetry(testClock, testRuntime, backoff, 10);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with infinity', async () => {
            const timeout = new InfiniteRetry(testRuntime, backoff);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });
    });
});
