import { deepStrictEqual, strictEqual } from 'assert';

import { Duration } from '@lib/entity/duration';
import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';
import { Semaphore } from '@lib/sync/semaphore';

import { ExponentialBackoff } from './backoff/exponential';
import { MaxCountRetry } from './maxCount';
import { Executable } from './retry';
import { ErrorCode } from '@lib/error/errors';

describe('MaxCount', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executable: Executable;
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let duration: Duration;
    let beforeThreadSleep: (duration?: Duration) => Promise<void>;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        beforeThreadSleep = async (_duration?: Duration) => {
            beforeSleepSemaphore.release();
            if (_duration) {
                duration = _duration;
            }
        };
    });

    it.each([
        ["should succeed reaching max count", {
            errorCode: 'RequestTimeOut',
            retries: 2,
            error: undefined,
            runs: 2,
            maxCountNum: 3
        }],
        ["should get error when reaching max count",{
            errorCode: 'RequestTimeOut',
            retries: 2,
            error: { errorCode: 'RequestTimeOut', message: 'first error' },
            runs: 2,
            maxCountNum: 2
        }],
        ["should stop retry immediately",{
            errorCode: 'Unauthenticated',
            retries: 1,
            error: { errorCode: 'Unauthenticated', message: 'first error' },
            runs: 1,
            maxCountNum: 3
        }],
    ])('%s', async (_, {errorCode, retries, error, runs, maxCountNum}) => {
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
        const maxCount = new MaxCountRetry(testRuntime, backoff, maxCountNum, beforeThreadSleep);
        (async () => {
            const [retriesRes, errorRes] = await maxCount.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retriesRes, retries);
            strictEqual(duration.totalMilliSeconds, 8);
            deepStrictEqual(errorRes, error);
            exitSemaphore.release();
        })().then();

        for (let run = 0; run < runs; run++) {
            await beforeSleepSemaphore.wait();
            strictEqual(executable.count, run + 1);
            testRuntime.threadAwake();
        }

        await exitSemaphore.wait();
    });
});
