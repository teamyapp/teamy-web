import { Retry } from "./retry";
import { BackOff } from "./backoff";
import { Clock } from "./clock";

export class MaxCount implements Retry {
    constructor(private clock: Clock, private backoff: BackOff, private maxCount: number) {}

    public withRetry(execute: () => Promise<Error | null>): Promise<[number, Error | null]> {
        let retries = 0
        let err: Error | null
        return new Promise(async (resolve) => {
            while(retries < this.maxCount) {
                retries++

                err = await execute()
                if (err === null) {
                    this.backoff.onSuccess()
                    resolve([retries, null])
                    return
                }

                this.backoff.onFailure()
                await this.clock.wait(this.backoff.delay())
            }

            resolve(([retries, err]))
        })        
        
    }

}