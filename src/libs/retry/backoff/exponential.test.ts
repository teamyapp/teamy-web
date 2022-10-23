import { strictEqual } from 'assert';

import { Exponential } from './exponential';

describe('Exponential', () => {
    it('should create default exponential', () => {
        const exponential = new Exponential();
        strictEqual(exponential.delay().totalMilliSeconds, 200);
    });

    it('should not override default nextDelay', () => {
        const exponential = new Exponential({ nextDelay: 300 });
        strictEqual(exponential.delay().totalMilliSeconds, 200);
    });

    describe('randomized', () => {
        beforeEach(() => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
        });
        it('should add next delay after failure', () => {
            const exponential = new Exponential({
                minDelay: 4,
                randomOffset: 10,
            });
            strictEqual(exponential.delay().totalMilliSeconds, 4);
            exponential.onFailure();
            strictEqual(exponential.delay().totalMilliSeconds, 21);
        });

        it('should reduce next delay after success', () => {
            const exponential = new Exponential({
                minDelay: 4,
                randomOffset: 10,
            });
            strictEqual(exponential.delay().totalMilliSeconds, 4);
            exponential.onSuccess();
            strictEqual(exponential.delay().totalMilliSeconds, 9);
        });
        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore();
        })
    });

    it('should not wait more than max delay', () => {
        const exponential = new Exponential({
            minDelay: 4,
            maxDelay: 10,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 4);
        exponential.onFailure();
        strictEqual(exponential.delay().totalMilliSeconds, 10);
    });

    it('should not wait less than min delay', () => {
        const exponential = new Exponential({
            minDelay: 10,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 10);
        exponential.onSuccess();
        strictEqual(exponential.delay().totalMilliSeconds, 10);
    });

    it('should reset delay after success', () => {
        const exponential = new Exponential({
            minDelay: 4,
            resetOnSuccess: true,
            randomOffset: 0,
        });
        strictEqual(exponential.delay().totalMilliSeconds, 4);
        exponential.onSuccess();
        strictEqual(exponential.delay().totalMilliSeconds, 4);
    });
});
