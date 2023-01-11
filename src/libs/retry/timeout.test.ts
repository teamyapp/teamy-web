import { deepStrictEqual, strictEqual } from 'assert';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { Executable } from './retry';
import { TimeoutRetry } from './timeout';

describe('Timeout', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executable: Executable;
    let duration: Duration;
    let beforeRetryDelay: () => Promise<void>;
    let beforeThreadSleep: (duration?: Duration) => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        testClock = new TestClock();

        beforeRetryDelay = async () => {
            testClock.setCurrentTime(new Date(testClock.now().getTime() + 2));
        };
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        testClock.setCurrentTime(new Date());

        beforeThreadSleep = async (_duration?: Duration) => {
            beforeSleepSemaphore.release();
            if (_duration) {
                duration = _duration;
                testClock.setCurrentTime(
                    new Date(
                        testClock.now().getTime() + duration.totalMilliSeconds,
                    ),
                );
            }
        };
    });

    it.each([
        ["should succeed before timeout", {
            errorCode: 'RequestTimeOut',
            retries: 2,
            error: undefined,
            timeoutDuration: 17,
            runs: 2
        }],
        ["should get error when reaching timeout",{
            errorCode: 'RequestTimeOut',
            retries: 2,
            error: { errorCode: 'RequestTimeOut', message: 'first error' },
            timeoutDuration: 16,
            runs: 1
        }],
        ["should stop retry immediately",{
            errorCode: 'Unauthenticated',
            retries: 1,
            error: { errorCode: 'Unauthenticated', message: 'first error' },
            timeoutDuration: 17,
            runs: 1
        }],
    ])(
        '%s',
        async (_, { errorCode, retries, error, timeoutDuration, runs }) => {
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
                beforeThreadSleep,
            );

            (async () => {
                const [retriesRes, errorRes] = await timeout.withRetry(
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, retries);
                deepStrictEqual(errorRes, error);
                exitSemaphore.release();
            })();

            for (let run = 0; run < runs; run++) {
                await beforeSleepSemaphore.wait();
                strictEqual(executable.count, run + 1);
                testRuntime.threadAwake();
            }

            await exitSemaphore.wait();
        },
    );
});
