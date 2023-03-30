import { InternalError, getErrCategory } from '@lib/error/errors';
import { Runtime } from '@lib/runtime/runtime';

import { BackOff } from './backoff/backoff';
import { Retry } from './retry';
import { Logger } from '@lib/telemetry/Logger';
import { BodyProp, ErrCategoryProp, ErrCodeProp } from '@lib/telemetry/Props';
export class InfiniteRetry implements Retry {
    constructor(
        private runtime: Runtime,
        private logger: Logger,
        private shortBackOff: BackOff,
        private longBackOff: BackOff,
        private beforeSkipRetry?: () => Promise<void>,
    ) {}

    public withRetry(
        context: Record<string, string>,
        execute: () => Promise<InternalError | undefined>,
    ): Promise<[number, InternalError | undefined]> {
        return new Promise(async (resolve) => {
            let retries = 0;
            while (true) {
                const err = await execute();
                retries++;
                if (err === undefined) {
                    this.shortBackOff.onSuccess();
                    this.longBackOff.onSuccess();
                    resolve([retries, undefined]);
                    return;
                }
                this.logger.logWithContext('Error', {
                    [ErrCodeProp]: err.errorCode,
                    [BodyProp]: err.message,
                }, context)
                const errorCategory = getErrCategory(err);
                this.logger.logWithContext('Warning', {
                    [ErrCategoryProp]: errorCategory,
                }, context);

                switch (errorCategory) {
                    case 'ClientInteraction':
                        await this.beforeSkipRetry?.call(null);
                        resolve([retries, err]);
                        return;
                    case 'Transient':
                        this.shortBackOff.onFailure();
                        await this.runtime.threadSleep(
                            this.shortBackOff.delay(),
                        );

                        break;
                    case 'Outage':
                        this.longBackOff.onFailure();
                        await this.runtime.threadSleep(
                            this.longBackOff.delay(),
                        );

                        break;
                }
            }
        });
    }
}
