import { strictEqual } from 'assert';
import { ExponentialBuilder } from '../backoff/exponential';
import { Timeout } from '../timeout';
import { MockClock } from '../clock';
import { Executable } from './retry.test';

describe('Timeout', () => {
    let clock: MockClock
    let executeObj: Executable
    let executeSpy: jest.SpyInstance
    let waitSpy: jest.SpyInstance
    let originalDate:Date
    let beforeRetryDelay: () => Promise<void>
    beforeEach(() => {
        clock = new MockClock()
        originalDate = new Date()
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

        beforeRetryDelay = async() => {
            clock.setCurrentTime(new Date(originalDate.getTime() + 2))
        }
        clock.setCurrentTime(originalDate)
        executeSpy = jest.spyOn(executeObj, "execute")
        waitSpy = jest.spyOn(clock, "wait")
    })

    it("should get result in time", async () => {
        const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
        const timeout = new Timeout(clock ,backoff, 3, beforeRetryDelay)
        const [retries, error] = await timeout.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 2)
        strictEqual(error, null)
    },)

    it("should throw error if not getting result in time", async () => {
        const backoff = new ExponentialBuilder({minDelay: 2, randomOffset: 0, scalingFactor: 2}).build()
        const timeout = new Timeout(clock ,backoff, 1, beforeRetryDelay)
        const [retries, error] = await timeout.withRetry(executeObj.execute.bind(executeObj))
        strictEqual(retries, 1)
        strictEqual(error?.message, "first error")
    })
});