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
}

describe('Retry', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executeObj: Executable;
    let backoff: BackOff;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        backoff = new Exponential(testRandGen);
        testClock = new TestClock();
        executeObj = {
            count: 0,
            async execute() {
                if (this.count === 0) {
                    this.count++;
                    return new Error('first error');
                } else {
                    this.count++;
                }
            },
        };
    });

    describe('Retry', () => {
        it('should work with maxCount', async () => {
            const maxCount = new MaxCount(testRuntime, backoff, 10);
            await maxCount.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with timeout', async () => {
            const timeout = new Timeout(testClock, testRuntime, backoff, 10);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });

        it('should work with infinity', async () => {
            const timeout = new Infinite(testRuntime, backoff);
            await timeout.withRetry(executeObj.execute.bind(executeObj));
        });
    });
});
