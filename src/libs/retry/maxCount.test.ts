import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { Exponential } from './backoff/exponential';
import { MaxCount } from './maxCount';
import { Executable } from './retry.test';
import { Duration } from '@lib/entity/duration';

describe('MaxCount', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let duration: Duration;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        executable = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < 2) {
                    return new Error('first error');
                }
            },
        };
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration
        };
    });

    it('should get result before reaching max count', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const maxCount = new MaxCount(testRuntime, backoff, 3);
        (async () => {
            const [retries, error] = await maxCount.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 2);
            strictEqual(duration.totalMilliSeconds, 16)
            strictEqual(error, undefined);
            exitSemaphore.release();
        })().then();

        await beforeSleepSemaphore.wait();
        strictEqual(duration.totalMilliSeconds, 4)
        strictEqual(executable.count, 1);
        testRuntime.threadAwake();

        await beforeSleepSemaphore.wait();
        strictEqual(duration.totalMilliSeconds, 16)
        strictEqual(executable.count, 2);

        testRuntime.threadAwake();
        await exitSemaphore.wait();
    });

    it('should not call more than max count retries', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const maxCount = new MaxCount(testRuntime, backoff, 2);
        (async () => {
            const [retries, error] = await maxCount.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 2);
            strictEqual(duration.totalMilliSeconds, 16)
            strictEqual(error?.message, 'first error');
            exitSemaphore.release();
        })().then();

        await beforeSleepSemaphore.wait();
        strictEqual(executable.count, 1);
        strictEqual(duration.totalMilliSeconds, 4)
        testRuntime.threadAwake();

        await beforeSleepSemaphore.wait();
        strictEqual(executable.count, 2);
        strictEqual(duration.totalMilliSeconds, 16)
        testRuntime.threadAwake();

        await exitSemaphore.wait();
    });
});
