import { deepStrictEqual, strictEqual } from 'assert';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { MaxCountRetry } from './maxCount';
import { Executable } from './testUtils';

describe('MaxCount', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSleepSemaphore: Semaphore;
    let beforeSkipRetrySemaphore: Semaphore;
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
        };
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration;
        };
    });

    it.each([
        [
            'should succeed reaching max count',
            {
                errorCode: 'RequestTimeOut',
                retries: 2,
                expectedErrorCode: undefined,
                runs: 2,
                maxCountNum: 3,
                runSkipRetry: false,
            },
        ],
        [
            'should get error when reaching max count',
            {
                errorCode: 'RequestTimeOut',
                retries: 2,
                expectedErrorCode: 'RequestTimeOut',
                runs: 2,
                maxCountNum: 2,
                runSkipRetry: false,
            },
        ],
        [
            'should stop retry immediately',
            {
                errorCode: 'Unauthenticated',
                retries: 1,
                expectedErrorCode: 'Unauthenticated',
                runs: 1,
                maxCountNum: 3,
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
                runs,
                maxCountNum,
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
            const maxCount = new MaxCountRetry(
                testRuntime,
                backoff,
                maxCountNum,
                beforeSkipRetry,
            );
            (async () => {
                const [retriesRes, errorRes] = await maxCount.withRetry(
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, retries);
                strictEqual(duration.totalMilliSeconds, 8);
                deepStrictEqual(errorRes?.errorCode, expectedErrorCode);
                exitSemaphore.release();
            })().then();

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
