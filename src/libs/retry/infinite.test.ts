import { strictEqual } from 'assert';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';
import { TestRuntime } from '@lib/runtime/runtime';

import { Exponential } from './backoff/exponential';
import { Infinite } from './infinite';
import { Executable } from './retry.test';

describe('Infinite', () => {
    const testRandGen = new TestRandomNumberGenerator();
    let testRuntime: TestRuntime;
    let executeObj: Executable;

    beforeEach(() => {
        testRuntime = new TestRuntime();
        executeObj = {
            count: 0,
            async execute() {
                if (this.count < 99) {
                    this.count++;
                    return new Error('first error');
                } else {
                    this.count++;
                }
            },
        };
    });

    it('should call execute until get successful result', async () => {
        const backoff = new Exponential(testRandGen, {
            minDelay: 2,
            randomOffset: 0,
            scalingFactor: 2,
        });
        const infinite = new Infinite(testRuntime, backoff);
        const [retries, error] = await infinite.withRetry(
            executeObj.execute.bind(executeObj),
        );
        strictEqual(retries, 100);
        strictEqual(error, null);
    });
});
