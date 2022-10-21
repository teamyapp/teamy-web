import { Retry } from "./retry";
import { BackOff } from "./backoff";
import { Clock } from "./clock";

export class Infinite implements Retry {
    constructor(private clock: Clock, private backoff: BackOff) {}

    public withRetry(execute: () => Promise<Error | null>): Promise<[number, Error | null]> {
        let retries = 0
        return new Promise(async (resolve) => {
            while(true) {
                retries++
                const err = await execute()
                if (err === null) {
                    this.backoff.onSuccess()
                    resolve([retries, null])
                    return
                }
    
                this.backoff.onFailure()
                await this.clock.wait(this.backoff.delay())
            }
        })        
        
    }

}