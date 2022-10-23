import { strictEqual } from 'assert';
import { Exponential } from './backoff/exponential';
import { MockClock } from './clock';
import { Infinite } from './infinite';
import { Executable } from './retry.test';

describe('Infinite', () => {
    let clock: MockClock
    let executeObj: Executable
    beforeEach(() => {
        clock = new MockClock()
        executeObj =  {
            count: 0,
            async execute() {
                if (this.count < 99) {
                    this.count++
                    return new Error("first error")
                } else {
                    this.count++
                    return null
                }

            }
        }
    })

    it("should call execute until get successful result", async () => {
        const backoff = new Exponential({minDelay: 2, randomOffset: 0, scalingFactor: 2})
        const infinite = new Infinite(clock, backoff)
        const [retries, error] = await infinite.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 100)
        strictEqual(error, null)
    })

});