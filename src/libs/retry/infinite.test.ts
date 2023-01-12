import { strictEqual } from 'assert';

import { Duration } from '@lib/entity/duration';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { InfiniteRetry } from './infinite';
import { ErrorCode, InternalError } from '@lib/error/errors';

export interface Executable {
    count: number,
    execute: () => Promise<InternalError | undefined>,
}


describe('InfiniteRetry', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSkipRetrySemaphore: Semaphore;
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let duration: Duration;
    let beforeSkipRetry: () => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        beforeSkipRetrySemaphore = new Semaphore('BeforeSkipRetry');
        exitSemaphore = new Semaphore('Exit');
        beforeSkipRetry = async () => {
            beforeSkipRetrySemaphore.release();
        }
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration;
        };
    });

    it.each([
        ["retry until succeeded", {
            errorCode: 'RequestTimeOut',
            retries: 10,
            expectedErrorCode: undefined,
            runs: 10,
            runSkipRetry: false,
        }],
        ["should stop retry immediately",{
            errorCode: 'Unauthenticated',
            retries: 1,
            expectedErrorCode: 'Unauthenticated',
            runs: 1,
            runSkipRetry: true
        }],
    ])('$s', async (_, {errorCode, retries, expectedErrorCode, runs, runSkipRetry}) => {
        executable = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < retries) {
                    return {
                        errorCode: errorCode as ErrorCode,
                        message: 'first error'
                    }
                }
            },
        };

        const backoff =new ExponentialBackoff(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
            maxDelay: 600,
        });
        const infinite = new InfiniteRetry(testRuntime, backoff, beforeSkipRetry);

        (async () => {
            const [retriesRes, errorRes] = await infinite.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retriesRes, retries);
            strictEqual(duration.totalMilliSeconds, 600);
            strictEqual(errorRes?.errorCode, expectedErrorCode);
            exitSemaphore.release();
        })().then();

        for (let retry = 1; retry <= runs; retry++) {
            if (runSkipRetry) {
                await beforeSkipRetrySemaphore.wait()
            } else {
                await beforeSleepSemaphore.wait();
            }
            
            strictEqual(executable.count, retry);
            testRuntime.threadAwake();
        }
    });
});
