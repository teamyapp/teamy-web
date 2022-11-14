import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';
import { CommitProp } from '../Props';

export const logWithCommit: (commitId: string) => Middleware<Logger> =
    (commitId: string) =>
    (logger: Logger): Logger => {
        return {
            logWithContext(level, props, context) {
                logger.logWithContext(
                    level,
                    { ...props, [CommitProp]: commitId },
                    context,
                );
            },
        };
    };
