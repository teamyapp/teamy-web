import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestClock } from '@lib/runtime/clock';
import { TestRuntime } from '@lib/runtime/runtime';

import { Exponential } from './backoff/exponential';
import { Executable } from './retry.test';
import { Timeout } from './timeout';
import { Semaphore } from '@lib/sync/semaphore';
import { Duration } from '@lib/entity/duration';

describe('Timeout', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let beforeSleepSemaphore: Semaphore;
    let exitSemaphore: Semaphore;
    let testRuntime: TestRuntime;
    let testClock: TestClock;
    let executable: Executable;
    let duration: Duration

    beforeEach(() => {
        testRuntime = new TestRuntime();
        testClock = new TestClock();

        executable = {
            count: 0,
            async execute() {
                const prevCount = this.count;
                this.count++;
                if (prevCount < 2) {
                    return new Error('first error');
                }
            },  
            async beforeRetryDelay() {
                testClock.setCurrentTime(new Date(testClock.now().getTime() + 2));
            }
        };

        beforeSleepSemaphore = new Semaphore('BeforeSleep');
        exitSemaphore = new Semaphore('Exit');
        testClock.setCurrentTime(new Date());
        testRuntime.beforeThreadSleep = async (_duration: Duration) => {
            beforeSleepSemaphore.release();
            duration = _duration
            testClock.setCurrentTime(new Date(testClock.now().getTime() + duration.totalMilliSeconds))
        };
    });

    it('should succeed before timeout', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });

        const timeout = new Timeout(
            testClock,
            testRuntime,
            backoff,
            25,
            executable.beforeRetryDelay?.bind(executable),
        );

        (async () => {
            const [retries, error] = await timeout.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 2);
            strictEqual(error, undefined);
            exitSemaphore.release();
        })()

        await beforeSleepSemaphore.wait()
        strictEqual(executable.count, 1)
        testRuntime.threadAwake()

        await beforeSleepSemaphore.wait()
        strictEqual(executable.count, 2)
        testRuntime.threadAwake()

        await exitSemaphore.wait()
    });

    it('should get error when reaching timeout', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });

        const timeout = new Timeout(
            testClock,
            testRuntime,
            backoff,
            24,
            executable.beforeRetryDelay?.bind(executable),
        );

        (async () => {
            const [retries, error] = await timeout.withRetry(
                executable.execute.bind(executable),
            );

            strictEqual(retries, 2);
            strictEqual(error?.message, "first error");
            exitSemaphore.release();
        })()

        await beforeSleepSemaphore.wait()
        strictEqual(executable.count, 1)
        testRuntime.threadAwake()

        await exitSemaphore.wait()
    });
});
