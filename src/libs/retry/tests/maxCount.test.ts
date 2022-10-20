import { strictEqual } from 'assert';
import { ExponentialBuilder } from '../backoff/exponential';
import { MockClock } from '../clock';
import { MaxCount } from '../maxCount';
import { Executable } from './retry.test';

describe('MaxCount', () => {
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

    it("should get result before reaching max count", async () => {
        const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
        const maxCount = new MaxCount(clock, backoff, 2)
        const [retries, error] = await maxCount.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 2)
        strictEqual(error, null)
    })

    it("should not call more than max count retries", async () => {
        const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
        const maxCount = new MaxCount(clock, backoff, 1)
        const [retries, error] = await maxCount.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 1)
        strictEqual(error?.message, "first error")
    })
});