import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Exponential } from './backoff/exponential';
import { Infinite } from './infinite';
import { MaxCount } from './maxCount';
import { Timeout } from './timeout';

export interface Executable {
    count: number;
    execute: () => Promise<undefined | Error>;
    beforeRetryDelay?: () => Promise<void>;
}

describe('Retry', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executeObj: Executable;
    let backoff: BackOff;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        backoff = new Exponential(testRandGen);
        executeObj = {
            count: 0,
            async execute() {
                return undefined
            },
        };
    });

    describe('Retry', () => {
        it('should work with maxCount', async () => {
            const maxCount = new MaxCount(testRuntime, backoff, 10);
            await maxCount.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with timeout', async () => {
            const testClock = new TestClock()
            const timeout = new Timeout(testClock, testRuntime, backoff, 10);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with infinity', async () => {
            const timeout = new Infinite(testRuntime, backoff);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });
    });
});
