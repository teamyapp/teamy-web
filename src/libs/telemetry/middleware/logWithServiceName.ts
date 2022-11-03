import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';

export const logWithServiceName: (serviceName: string) => Middleware<Logger> = (serviceName) => (
    logger: Logger,
): Logger => {
    return {
        logWithContext(context, level, props) {
            logger.logWithContext(context, level, {...props, ServiceName: serviceName})
        },
    };
};