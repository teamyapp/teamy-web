import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';

import { Exponential } from './backoff/exponential';
import { Infinite } from './infinite';
import { Executable } from './retry.test';
import { Semaphore } from '@lib/sync/semaphore';
import { Duration } from '@lib/entity/duration';

describe('Infinite', () => {
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
                if (prevCount < 10) {
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

    it('should call execute until max time', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const infinite = new Infinite(testRuntime, backoff);


        (async () => {
            const [retries, error] = await infinite.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 10);
            strictEqual(duration.totalMilliSeconds, 60000)
            strictEqual(error, undefined);
            exitSemaphore.release();
        })().then();
        

        for (let time = 1; time <= 10; time++) {
            await beforeSleepSemaphore.wait();
            strictEqual(executable.count, time);
            testRuntime.threadAwake();
        }
    });
});
