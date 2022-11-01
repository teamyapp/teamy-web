import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';

export const logWithRequestId: Middleware<Logger> = (
    logger: Logger,
): Logger => {
    return {
        logWithContext(context, level, props) {
            logger.logWithContext(context, level, {...props, RequestId: context.requestId})
        },
    };
};