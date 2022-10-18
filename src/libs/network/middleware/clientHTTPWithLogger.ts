import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Logger } from '@lib/telemetry/Logger';
import { Prop } from '@lib/telemetry/Props';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient } from '../HTTP.client';
import { REQUEST_ID_HEADER } from './headers';

const fileName = "src/libs/network/middleware/clientHTTPWithLogger.ts"

export const clientHTTPWithLogger: (logger: Logger) => Middleware<HTTPClient> =
        (logger: Logger) =>
        (httpClient: HTTPClient): HTTPClient => {
            return {
                request: (
                    url: string,
                    options?: {
                        method: string;
                        headers?: Record<string, string>;
                        body?: string;
                    },
                ): Promise<Result<string, Errors>> => {
                    const context = {
                        requestId: options?.headers && options?.headers[REQUEST_ID_HEADER]
                    }

                    logger.logWithContext(context,  "Info", {
                        [Prop.FileName]: fileName,
                        [Prop.LineNumber]: "28"
                    })

                    return httpClient.request(url, options);
                },
            };
        };
