import { Retry } from "./retry";
import { BackOff } from "./backoff";
import { Clock } from "./clock";

export class Timeout implements Retry {
    constructor(private clock: Clock, private backoff: BackOff, private duration: number, private beforeRetryDelay?: () => Promise<void>) {}

    public withRetry(execute: () => Promise<Error | null>): Promise<[number, Error | null]> {
        let retries = 0
        let err: Error | null
        const expiredAt = this.clock.now().getTime() + this.duration
        return new Promise(async (resolve) => {
            while(true) {
                retries++
                err = await execute()
                await this.beforeRetryDelay?.call(null)
                if (err === null) {
                    this.backoff.onSuccess()
                    resolve([retries, null])
                    return
                }
                
                this.backoff.onFailure();
                if (this.clock.now().getTime() + this.backoff.delay() >= expiredAt) {
                    break
                }

            }

            resolve(([retries, err]))
        })        
    }
}