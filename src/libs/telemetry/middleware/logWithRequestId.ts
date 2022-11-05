import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';
import { RequestIdProp } from '../Props';

export const logWithRequestId: Middleware<Logger> = (
    logger: Logger,
): Logger => {
    return {
        logWithContext(level, props, context) {
            logger.logWithContext(level, {...props, [RequestIdProp]: context?.requestId}, context)
        },
    };
};