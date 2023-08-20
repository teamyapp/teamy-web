import { Middleware } from '@lib/middleware/middleware';

import { Logger } from '../Logger';
import { ServiceNameProp } from '../Props';

export const logWithServiceName: (serviceName: string) => Middleware<Logger> =
    (serviceName) =>
    (logger: Logger): Logger => {
        return {
            logWithContext(level, props, context) {
                logger.logWithContext(
                    level,
                    { ...props, [ServiceNameProp]: serviceName },
                    context,
                );
            },
        };
    };
