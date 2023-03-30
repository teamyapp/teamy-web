import { strictEqual } from 'assert';
import { beforeEach, describe, it } from 'vitest';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';
import { Logger } from '@lib/telemetry/Logger';
import { RawLogger } from '@lib/telemetry/RawLogger';

import { ExponentialBackoff } from './backoff/exponential';
import { Executable } from './testUtils';
import {
    CLIENT_INTERACTION_ERR,
    LONG_DELAY,
    OUTAGE_ERR,
    RANDOM_OFFSET,
    SHORT_DELAY,
    TRANSIENT_ERR,
} from './testing';
import { TimeoutRetry } from './timeout';

describe('Timeout', () => {
    const testRandGen = new TestRandomNumberGenerator();
    testRandGen.setRandomFloats([1]);
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executable: Executable;
    let duration: Duration;
    let testLogger: Logger;
    let beforeRetryDelay: () => Promise<void>;
    let beforeSkipRetry: () => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        testClock = new TestClock();
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        testClock.setCurrentTime(new Date());
        beforeSkipRetry = async () => {
            beforeSleepSemaphore.release();
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
        
        testLogger = new RawLogger('Debug', new TestRuntime(), {});
    });

    it.each([
        [
            'Stop retry with ClientInteraction err category',
            {
                errCodes: [TRANSIENT_ERR, OUTAGE_ERR, CLIENT_INTERACTION_ERR],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                ],
                timeout: 10000,
                executeDuration: [2000, 3000, 4000],
                expectRetries: 3,
                expectErr: {
                    code: CLIENT_INTERACTION_ERR,
                },
                sleepAwakeCount: 2,
            },
        ],
        [
            'Stop retry with ClientInteraction err category',
            {
                errCodes: [TRANSIENT_ERR, OUTAGE_ERR, null],

                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                ],
                timeout: 10000,

                executeDuration: [2000, 3000, 4000],
                expectRetries: 3,
                expectErr: undefined,
                sleepAwakeCount: 2,
            },
        ],
        [
            'Not Succeed, max timeout reached',
            {
                errCodes: [TRANSIENT_ERR, OUTAGE_ERR, TRANSIENT_ERR],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                ],
                timeout: 10000,
                executeDuration: [2000, 3000, 4000],
                expectRetries: 3,
                expectErr: {
                    code: TRANSIENT_ERR,
                },
                sleepAwakeCount: 2,
            },
        ],
    ])(
        '%s',
        async (
            _,
            {
                errCodes,
                durations,
                timeout,
                executeDuration,
                expectRetries,
                expectErr,
                sleepAwakeCount,
            },
        ) => {
            executable = {
                count: 0,
                async execute() {
                    const prevCount = this.count;
                    this.count++;
                    if (prevCount < expectRetries) {
                        if (!errCodes[prevCount]) {
                            return undefined;
                        }

                        return {
                            errorCode: errCodes[prevCount] as ErrorCode,
                            message: 'first error',
                        };
                    }
                },
            };

            const shortBackOff = new ExponentialBackoff(testRandGen, {
                minDelay: SHORT_DELAY,
                randomOffset: 1,
            });
            const longBackOff = new ExponentialBackoff(testRandGen, {
                minDelay: LONG_DELAY,
                randomOffset: 1,
                resetOnSuccess: true,
            });

            beforeRetryDelay = async () => {
                testClock.setCurrentTime(
                    new Date(
                        testClock.now().getTime() +
                            executeDuration[executable.count - 1],
                    ),
                );
            };

            const timeoutRetry = new TimeoutRetry(
                testClock,
                testRuntime,
                testLogger,
                shortBackOff,
                longBackOff,
                timeout,
                beforeRetryDelay,
                beforeSkipRetry,
            );

            (async () => {
                const [retriesRes, errorRes] = await timeoutRetry.withRetry({},
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, expectRetries);
                strictEqual(errorRes?.errorCode, expectErr?.code);
                exitSemaphore.release();
            })();

            for (let retry = 1; retry <= sleepAwakeCount; retry++) {
                await beforeSleepSemaphore.wait();

                strictEqual(executable.count, retry);
                strictEqual(duration.totalMilliSeconds, durations[retry - 1]);
                testRuntime.threadAwake();
            }
        },
    );
});
