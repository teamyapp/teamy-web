import { strictEqual } from 'assert';
import { beforeEach, describe, it } from 'vitest';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { Executable } from './testUtils';
import { TimeoutRetry } from './timeout';

describe('Timeout', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let beforeSleepSemaphore: Semaphore;
    let beforeSkipRetrySemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executable: Executable;
    let duration: Duration;
    let beforeRetryDelay: () => Promise<void>;
    let beforeSkipRetry: () => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        testClock = new TestClock();

        beforeRetryDelay = async () => {
            testClock.setCurrentTime(new Date(testClock.now().getTime() + 2));
        };
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        beforeSkipRetrySemaphore = new Semaphore('BeforeSkipRetry');
        exitSemaphore = new Semaphore('Exit');
        testClock.setCurrentTime(new Date());
        beforeSkipRetry = async () => {
            beforeSkipRetrySemaphore.release();
        };
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration;
            testClock.setCurrentTime(
                new Date(
                    testClock.now().getTime() + duration.totalMilliSeconds,
                ),
            );
        };
    });

    it.each([
        [
            'should succeed before timeout',
            {
                errorCode: 'RequestTimeOut',
                retries: 2,
                expectedErrorCode: undefined,
                timeoutDuration: 17,
                runs: 2,
                runSkipRetry: false,
            },
        ],
        [
            'should get error when reaching timeout',
            {
                errorCode: 'RequestTimeOut',
                retries: 2,
                expectedErrorCode: 'RequestTimeOut',
                timeoutDuration: 16,
                runs: 1,
                runSkipRetry: false,
            },
        ],
        [
            'should stop retry immediately',
            {
                errorCode: 'Unauthenticated',
                retries: 1,
                expectedErrorCode: 'Unauthenticated',
                timeoutDuration: 17,
                runs: 1,
                runSkipRetry: true,
            },
        ],
    ])(
        '%s',
        async (
            _,
            {
                errorCode,
                retries,
                expectedErrorCode,
                timeoutDuration,
                runs,
                runSkipRetry,
            },
        ) => {
            executable = {
                count: 0,
                async execute() {
                    const prevCount = this.count;
                    this.count++;
                    if (prevCount < 2) {
                        return {
                            errorCode: errorCode as ErrorCode,
                            message: 'first error',
                        };
                    }
                },
            };

            const backoff = new ExponentialBackoff(testRandGen, {
                minDelay: 2,
                randomOffset: 0,
                scalingFactor: 2,
            });

            const timeout = new TimeoutRetry(
                testClock,
                testRuntime,
                backoff,
                timeoutDuration,
                beforeRetryDelay,
                beforeSkipRetry,
            );

            (async () => {
                const [retriesRes, errorRes] = await timeout.withRetry(
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, retries);
                strictEqual(errorRes?.errorCode, expectedErrorCode);
                exitSemaphore.release();
            })();

            for (let run = 0; run < runs; run++) {
                if (runSkipRetry) {
                    await beforeSkipRetrySemaphore.wait();
                } else {
                    await beforeSleepSemaphore.wait();
                }

                strictEqual(executable.count, run + 1);
                testRuntime.threadAwake();
            }

            await exitSemaphore.wait();
        },
    );
});
