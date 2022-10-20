import { notStrictEqual, strictEqual } from 'assert';
import { ExponentialBuilder } from '../backoff/exponential';
import { MockClock } from '../clock';
import { MaxCount } from '../maxCount';

export interface Executable {
    count: number
    execute: () => Promise<null | Error>
}

describe('Retry', () => {
    let clock: MockClock
    let executeObj: Executable
    let executeSpy: jest.SpyInstance
    let waitSpy: jest.SpyInstance
    beforeEach(() => {
        clock = new MockClock()
        executeObj =  {
            count: 0,
            async execute() {
                if (this.count === 0) {
                    this.count++
                    return new Error("first error")
                } else {
                    this.count++
                    return null
                }

            }
        }
        executeSpy = jest.spyOn(executeObj, "execute")
        waitSpy = jest.spyOn(clock, "wait")
    })

    describe("Exponential", () => {
            it("should reset delay when success", async () => {
                const backoff = new ExponentialBuilder({resetOnSuccess: true, minDelay: 1}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                const [retries, error] = await maxCount.withRetry(executeObj.execute.bind(executeObj))
                strictEqual(retries, 2);
                strictEqual(error, null)
                strictEqual(executeSpy.mock.calls.length, 2)
                strictEqual(backoff.delay(), 1)
            })

            it("should check wait time", async () => {
                const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
                strictEqual(waitSpy.mock.calls.length, 1)
                strictEqual(waitSpy.mock.calls[0][0], 4)
                strictEqual(backoff.delay(), 2)
            })

            it("should not wait more than max time", async () => {
                const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2, maxDelay: 2}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
                strictEqual(waitSpy.mock.calls.length, 1)
                strictEqual(waitSpy.mock.calls[0][0], 2)
            })

            it("should not wait less than min time", async () => {
                const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(jest.fn().mockResolvedValueOnce(null))
                strictEqual(backoff.delay(), 2)
                await maxCount.withRetry(jest.fn().mockResolvedValueOnce(null))
                strictEqual(backoff.delay(), 2)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
                strictEqual(1, waitSpy.mock.calls.length)
                strictEqual(4, waitSpy.mock.calls[0][0])
            })
    
            it("should not reset delay when success", async () => {
                const backoff = new ExponentialBuilder({resetOnSuccess: false, minDelay: 1}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
                notStrictEqual(backoff.delay(), 1)
            })

            it("should wait with a random factor", async () => {
                const backoff = new ExponentialBuilder({minDelay: 1, randomOffset: 1, randomOffsetUnit: 10}).build()
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
                strictEqual(backoff.delay() >= 1, true)
                strictEqual(backoff.delay() <= 11, true)
                strictEqual(backoff.delay() < 1, false)
                strictEqual(backoff.delay() > 11, false)
            })
    })
});
