import { strictEqual } from 'assert';
import { beforeEach, describe, it } from 'vitest';

import { Duration } from '@lib/entity/duration';
import { ErrorCode } from '@lib/error/errors';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';
import { Logger } from '@lib/telemetry/Logger';
import { RawLogger } from '@lib/telemetry/RawLogger';
import { TestTelemetryClient } from '@lib/telemetry/TelemetryClient';

import { ExponentialBackoff } from './backoff/exponential';
import { InfiniteRetry } from './infinite';
import { Executable } from './testUtils';
import {
    CLIENT_INTERACTION_ERR,
    LONG_DELAY,
    OUTAGE_ERR,
    RANDOM_OFFSET,
    SHORT_DELAY,
    TRANSIENT_ERR,
} from './testing';

describe.only('InfiniteRetry', () => {
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

        const telemetryClient = new TestTelemetryClient();
        testLogger = new RawLogger('Debug', new TestRuntime(), telemetryClient);
    });

    it.each([
        [
            'Stop retry with ClientInteraction err category',
            {
                errorCodes: [TRANSIENT_ERR, OUTAGE_ERR, CLIENT_INTERACTION_ERR],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                ],
                expectRetries: 3,
                expectErr: {
                    errorCode: CLIENT_INTERACTION_ERR,
                },
                sleepAwakeCount: 2,
            },
        ],
        [
            'Should retry until succeed with Transient and Outage err categories',
            {
                errorCodes: [
                    TRANSIENT_ERR,
                    OUTAGE_ERR,
                    TRANSIENT_ERR,
                    OUTAGE_ERR,
                    undefined,
                ],
                durations: [
                    SHORT_DELAY * 2 + RANDOM_OFFSET,
                    LONG_DELAY * 2 + RANDOM_OFFSET,
                    SHORT_DELAY * 4 + RANDOM_OFFSET,
                    LONG_DELAY * 4 + RANDOM_OFFSET,
                    LONG_DELAY * 4 + RANDOM_OFFSET,
                ],
                expectRetries: 5,
                expectErr: undefined,
                sleepAwakeCount: 4,
            },
        ],
    ])(
        '$s',
        async (
            _,
            {
                errorCodes,
                durations,
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
                        if (!errorCodes[prevCount]) {
                            return undefined;
                        }

                        return {
                            errorCode: errorCodes[prevCount] as ErrorCode,
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

            const infinite = new InfiniteRetry(
                testRuntime,
                testLogger,
                shortBackOff,
                longBackOff,
                beforeSkipRetry,
            );

            (async () => {
                const [retriesRes, errorRes] = await infinite.withRetry(
                    executable.execute.bind(executable),
                );

                strictEqual(retriesRes, expectRetries);
                strictEqual(errorRes?.errorCode, expectErr?.errorCode);
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
