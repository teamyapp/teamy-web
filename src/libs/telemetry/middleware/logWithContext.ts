import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';

export const logWithContext: Middleware<Logger> = (
    logger: Logger,
): Logger => {
    return {
        logWithContext(context, level, props) {
            logger.logWithContext(context, level, {...props, ...context})
        },
    };
};