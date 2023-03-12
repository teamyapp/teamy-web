import { strictEqual } from 'assert';
import { afterAll, beforeEach, describe, it } from 'vitest';

import { TestRandomNumberGenerator } from '@lib/math/randomNumberGenerator';

import { ExponentialBackoff } from './exponential';

describe('Exponential', () => {
    const testRandGen = new TestRandomNumberGenerator();

    it('should create default exponential backoff', () => {
        const exponentialBackoff = new ExponentialBackoff(testRandGen);
        strictEqual(exponentialBackoff.delay().totalMilliSeconds, 200);
    });

    it('should not override default nextDelay', () => {
        const exponentialBackoff = new ExponentialBackoff(testRandGen, {
            randomOffset: 3,
        });
        strictEqual(exponentialBackoff.delay().totalMilliSeconds, 200);
    });

    describe('randomized', () => {
        beforeEach(() => {
            testRandGen.setRandomFloats([0.5]);
        });

        it('should add next delay after failure', () => {
            const exponential = new ExponentialBackoff(testRandGen, {
                minDelay: 4,
                randomOffset: 10,
            });
            strictEqual(exponential.delay().totalMilliSeconds, 9);
            exponential.onFailure();
            strictEqual(exponential.delay().totalMilliSeconds, 13);
        });

        it('should reduce next delay after success', () => {
            const exponential = new ExponentialBackoff(testRandGen, {
                minDelay: 4,
                randomOffset: 10,
            });
            strictEqual(exponential.delay().totalMilliSeconds, 9);
            exponential.onSuccess();
            strictEqual(exponential.delay().totalMilliSeconds, 9);
        });

        afterAll(() => {
            testRandGen.setRandomFloats([]);
        });
    });

    it('should not wait more than max delay', () => {
        const exponential = new ExponentialBackoff(testRandGen, {
            minDelay: 4,
            maxDelay: 10,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 4);
        exponential.onFailure();
        exponential.onFailure();
        strictEqual(exponential.delay().totalMilliSeconds, 10);
    });

    it('should not wait less than min delay', () => {
        const exponential = new ExponentialBackoff(testRandGen, {
            minDelay: 10,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 10);
        exponential.onSuccess();
        strictEqual(exponential.delay().totalMilliSeconds, 10);
    });

    it('should scale down after success', () => {
        const exponential = new ExponentialBackoff(testRandGen, {
            minDelay: 4,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 4);
        exponential.onFailure();

        strictEqual(exponential.delay().totalMilliSeconds, 8);
        exponential.onFailure();

        strictEqual(exponential.delay().totalMilliSeconds, 16);
        exponential.onSuccess();

        strictEqual(exponential.delay().totalMilliSeconds, 8);
    });

    it('should reset delay after success', () => {
        const exponential = new ExponentialBackoff(testRandGen, {
            minDelay: 4,
            resetOnSuccess: true,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 4);
        exponential.onFailure();
        strictEqual(exponential.delay().totalMilliSeconds, 8);
        exponential.onFailure();
        strictEqual(exponential.delay().totalMilliSeconds, 16);
        exponential.onSuccess();

        strictEqual(exponential.delay().totalMilliSeconds, 4);
    });
});
