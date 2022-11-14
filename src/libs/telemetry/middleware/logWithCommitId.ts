import { Middleware } from '@lib/middleware/middleware';
import { getEnvVar } from '@core/env/environment';
import { Logger } from '../Logger';
import { CommitIdProp } from '../Props';

export const logWithCommitId: Middleware<Logger> = (logger: Logger): Logger => {
    return {
        logWithContext(level, props, context) {
            logger.logWithContext(
                level,
                { ...props, [CommitIdProp]: getEnvVar('GIT_LONG_COMMIT_HASH') },
                context,
            );
        },
    };
};
