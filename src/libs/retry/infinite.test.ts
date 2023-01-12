import { strictEqual } from 'assert';

import { Duration } from '@lib/entity/duration';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { InfiniteRetry } from './infinite';
import { Executable } from './retry';

describe('InfiniteRetry', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let duration: Duration;
    let beforeThreadSleep: (duration?: Duration) => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        executable = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < 10) {
                    return {
                        errorCode: 'RequestTimeOut',
                        message: 'first error'
                    }
                }
            },
        };
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        beforeThreadSleep = async (_duration?: Duration) => {
            beforeSleepSemaphore.release();
            if (_duration) {
                duration = _duration;
            }
        };
    });

    it('retry until succeeded', async () => {
        const backoff = new ExponentialBackoff(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
            maxDelay: 600,
        });
        const infinite = new InfiniteRetry(testRuntime, backoff, beforeThreadSleep);

        (async () => {
            const [retries, error] = await infinite.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 10);
            strictEqual(duration.totalMilliSeconds, 600);
            strictEqual(error, undefined);
            exitSemaphore.release();
        })().then();

        for (let retry = 1; retry <= 10; retry++) {
            await beforeSleepSemaphore.wait();
            strictEqual(executable.count, retry);
            testRuntime.threadAwake();
        }
    });
});
