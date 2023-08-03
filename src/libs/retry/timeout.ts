import { InternalError, getErrCategory } from '@lib/error/errors';
import { Clock } from '@lib/runtime/clock';
import { Runtime } from '@lib/runtime/runtime';
import { Logger } from '@lib/telemetry/Logger';
import { BodyProp, ErrCategoryProp, ErrCodeProp } from '@lib/telemetry/Props';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';

export class TimeoutRetry implements Retry {
    constructor(
        private clock: Clock,
        private runtime: Runtime,
        private logger: Logger,
        private shortBackOff: BackOff,
        private longBackOff: BackOff,
        private duration: number,
        private beforeRetryDelay?: () => Promise<void>,
        private beforeSkipRetry?: () => Promise<void>,
    ) {}

    public withRetry(
        context: Record<string, string>,
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        return new Promise(async (resolve) => {
            let retries = 0;
            let err: InternalError | undefined;
            const expiredAt = this.clock.now().getTime() + this.duration;

            while (true) {
                err = await execute();
                retries++;
                if (err === undefined) {
                    this.shortBackOff.onSuccess();
                    this.longBackOff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }

                this.logger.logWithContext(
                    'Error',
                    {
                        [ErrCodeProp]: err.errorCode,
                        [BodyProp]: err.message,
                    },
                    context,
                );
                const errorCategory = getErrCategory(err);
                this.logger.logWithContext(
                    'Warning',
                    {
                        [ErrCategoryProp]: errorCategory,
                    },
                    context,
                );
                await this.beforeRetryDelay?.call(null);

                let duration;
                switch (errorCategory) {
                    case 'ClientInteraction':
                        await this.beforeSkipRetry?.call(null);
                        resolve([retries, err]);
                        return;
                    case 'Transient':
                        this.shortBackOff.onFailure();
                        duration = this.shortBackOff.delay();
                        break;
                    case 'Outage':
                        this.longBackOff.onFailure();
                        duration = this.longBackOff.delay();
                        break;
                }

                if (
                    this.clock.now().getTime() + duration.totalMilliSeconds >=
                    expiredAt
                ) {
                    break;
                }

                await this.runtime.threadSleep(duration);
            }

            resolve([retries, err]);
        });
    }
}
