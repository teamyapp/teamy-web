import { Middleware } from '@lib/middleware/middleware';
import { Logger } from '../Logger';
import { CommitIdProp } from '../Props';

export const logWithCommitId: (commitId: string) => Middleware<Logger> =
    (commitId: string) =>
    (logger: Logger): Logger => {
        return {
            logWithContext(level, props, context) {
                logger.logWithContext(
                    level,
                    { ...props, [CommitIdProp]: commitId },
                    context,
                );
            },
        };
    };
