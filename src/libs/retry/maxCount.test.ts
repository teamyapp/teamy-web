import { strictEqual } from 'assert';
import { Exponential } from './backoff/exponential';
import { MockClock } from './clock';
import { MaxCount } from './maxCount';
import { Executable } from './retry.test';

describe('MaxCount', () => {
    let clock: MockClock
    let executeObj: Executable
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
    })

    it("should get result before reaching max count", async () => {
        const backoff = new Exponential({minDelay: 2, randomOffset: 0, scalingFactor: 2})
        const maxCount = new MaxCount(clock, backoff, 2)
        const [retries, error] = await maxCount.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 2)
        strictEqual(error, null)
    })

    it("should not call more than max count retries", async () => {
        const backoff = new Exponential({minDelay: 2, randomOffset: 0, scalingFactor: 2})
        const maxCount = new MaxCount(clock, backoff, 1)
        const [retries, error] = await maxCount.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 1)
        strictEqual(error?.message, "first error")
    })
});