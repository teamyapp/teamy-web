import { BackOff } from './backoff/backoff';
import { Exponential } from './backoff/exponential';
import { MockClock } from './clock';
import { Infinite } from './infinite';
import { MaxCount } from './maxCount';
import { Timeout } from './timeout';

export interface Executable {
    count: number
    execute: () => Promise<null | Error>
}

describe('Retry', () => {
    let clock: MockClock
    let executeObj: Executable
    let backoff: BackOff
    
    beforeEach(() => {
        backoff = new Exponential()
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

    describe("Retry", () => {
            it("should work with maxCount", async () => {
                const maxCount = new MaxCount(clock, backoff, 10)
                await maxCount.withRetry(executeObj.execute.bind(executeObj))
            })


            it("should work with timeout", async () => {
                const timeout = new Timeout(clock, backoff, 10)
                await timeout.withRetry(executeObj.execute.bind(executeObj))
            })

            it("should work with infinity", async () => {
                const timeout = new Infinite(clock, backoff)
                await timeout.withRetry(executeObj.execute.bind(executeObj))
            })            
    })
});
