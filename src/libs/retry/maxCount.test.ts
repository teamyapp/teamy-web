import { deepStrictEqual, strictEqual } from 'assert';
import { beforeEach, describe, it } from 'vitest';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';
import { Logger } from '@lib/telemetry/Logger';
import { RawLogger } from '@lib/telemetry/RawLogger';

import { ExponentialBackoff } from './backoff/exponential';
import { MaxCountRetry } from './maxCount';
import { Executable } from './testUtils';
import {
    CLIENT_INTERACTION_ERR,
    LONG_DELAY,
    OUTAGE_ERR,
    RANDOM_OFFSET,
    SHORT_DELAY,
    TRANSIENT_ERR,
} from './testing';

describe('MaxCount', () => {
    const testRandGen = new TestRandomNumberGenerator();
    testRandGen.setRandomFloats([1]);
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let duration: Duration;
    let testLogger: Logger;
    let beforeSkipRetry: () => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        beforeSkipRetry = async () => {
            beforeSleepSemaphore.release();
        };
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration;
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
                maxCount: 10,
                expectRetries: 3,
                expectErr: { code: CLIENT_INTERACTION_ERR },
                sleepAwakeCount: 2,
            },
        ],
        [
            'Succeed before reaching max count',
            {
                errCodes: [TRANSIENT_ERR, OUTAGE_ERR, null],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                ],
                maxCount: 10,
                expectRetries: 3,
                expectErr: undefined,
                sleepAwakeCount: 2,
            },
        ],
        [
            'Not Succeed, max count retries reached',
            {
                errCodes: [
                    TRANSIENT_ERR,
                    OUTAGE_ERR,
                    TRANSIENT_ERR,
                    OUTAGE_ERR,
                    OUTAGE_ERR,
                ],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    SHORT_DELAY * 4 + RANDOM_OFFSET,
                    LONG_DELAY * 4 + RANDOM_OFFSET,
                    LONG_DELAY * 8 + RANDOM_OFFSET,
                ],
                maxCount: 5,
                expectRetries: 5,
                expectErr: { code: OUTAGE_ERR },
                sleepAwakeCount: 5,
            },
        ],
    ])(
        '%s',
        async (
            _,
            {
                errCodes,
                durations,
                maxCount,
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

            const maxCountRetry = new MaxCountRetry(
                testRuntime,
                testLogger,
                shortBackOff,
                longBackOff,
                maxCount,
                beforeSkipRetry,
            );
            (async () => {
                const [retriesRes, errorRes] = await maxCountRetry.withRetry({},
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, expectRetries);
                deepStrictEqual(errorRes?.errorCode, expectErr?.code);
                exitSemaphore.release();
            })().then();

            for (let retry = 1; retry <= sleepAwakeCount; retry++) {
                await beforeSleepSemaphore.wait();

                strictEqual(executable.count, retry);
                strictEqual(duration.totalMilliSeconds, durations[retry - 1]);
                testRuntime.threadAwake();
            }
        },
    );
});
