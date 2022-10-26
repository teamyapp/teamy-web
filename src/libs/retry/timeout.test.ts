import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';

import { Exponential } from './backoff/exponential';
import { Executable } from './retry.test';
import { Timeout } from './timeout';

describe('Timeout', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executeObj: Executable;
    let originalDate: Date;
    let beforeRetryDelay: () => Promise<void>;
    beforeEach(() => {
        testRuntime = new TestRuntime();
        testClock = new TestClock();
        originalDate = new Date();
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

        beforeRetryDelay = async () => {
            testClock.setCurrentTime(new Date(originalDate.getTime() + 2));
        };
        testClock.setCurrentTime(originalDate);
    });

    it('should get result in time', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const timeout = new Timeout(
            testClock,
            testRuntime,
            backoff,
            7,
            beforeRetryDelay,
        );
        const [retries, error] = await timeout.withRetry(
            executeObj.execute.bind(executeObj),
        );
        strictEqual(retries, 2);
        strictEqual(error, null);
    });

    it('should throw error if not getting result in time', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const timeout = new Timeout(
            testClock,
            testRuntime,
            backoff,
            1,
            beforeRetryDelay,
        );
        const [retries, error] = await timeout.withRetry(
            executeObj.execute.bind(executeObj),
        );
        strictEqual(retries, 1);
        strictEqual(error?.message, 'first error');
    });
});
