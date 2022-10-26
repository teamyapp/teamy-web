import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { Exponential } from './backoff/exponential';
import { MaxCount } from './maxCount';
import { Executable } from './retry.test';

describe('MaxCount', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executeObj: Executable;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        executeObj = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < 2) {
                    return new Error('first error');
                }
            },
        };
    });

    it('should get result before reaching max count', async () => {
        const beforeSleepSemaphore = new Semaphore('BeforeSleep');
        const exitSemaphore = new Semaphore('Exit');
        testRuntime.beforeThreadSleep = async () => {
            beforeSleepSemaphore.release();
        };

        let executable: Executable = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < 2) {
                    return new Error('first error');
                }
            },
        };

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
            strictEqual(error, undefined);
            exitSemaphore.release();
        })().then();

        await beforeSleepSemaphore.wait();
        strictEqual(executable.count, 1);
        testRuntime.threadAwake();

        await beforeSleepSemaphore.wait();
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
        const maxCount = new MaxCount(testRuntime, backoff, 1);
        const [retries, error] = await maxCount.withRetry(
            executeObj.execute.bind(executeObj),
        );
        strictEqual(retries, 1);
        strictEqual(error?.message, 'first error');
    });
});
