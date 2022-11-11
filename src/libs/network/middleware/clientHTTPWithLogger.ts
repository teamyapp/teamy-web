import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Logger } from '@lib/telemetry/Logger';
import {
    BodyProp,
    CauseProp,
    FileNameProp,
    HeadersProp,
    LineNumberProp,
    MethodProp,
    StageProp,
} from '@lib/telemetry/Props';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient,HTTPRequestOptions, HTTPResponse } from '../HTTP.client';

export const clientHTTPWithLogger: (logger: Logger) => Middleware<HTTPClient> =
    (logger: Logger) =>
    (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options?: HTTPRequestOptions,
                context?: Record<string, string>,
            ): Promise<Result<HTTPResponse, InternalError>> => {
                logger.logWithContext(
                    'Info',
                    {
                        [HeadersProp]: JSON.stringify(options?.headers),
                        [MethodProp]: options?.method || 'Get',
                        [BodyProp]: options?.body
                            ? JSON.stringify(options?.body)
                            : '',
                        [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                        [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                        [StageProp]: 'begin'
                    },
                    context,
                );
                const [result, error] = await httpClient.request(
                    url,
                    options,
                    context,
                );

                if (error) {
                    logger.logWithContext(
                        'Error',
                        {
                            [CauseProp]: error,
                        },
                        context,
                    );
                }

                logger.logWithContext(
                    'Info',
                    {
                        [HeadersProp]: result?.headers
                            ? JSON.stringify(result.headers)
                            : '',
                        [MethodProp]: options?.method || 'Get',
                        [BodyProp]: result?.body,
                        [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                        [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                        [StageProp]: 'end'
                    },
                    context,
                );
                return [result, error];
            },
        };
    };
