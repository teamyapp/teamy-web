import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Logger } from '@lib/telemetry/Logger';
import {
    BodyProp,
    CauseProp,
    FileNameProp,
    HeadersProp,
    HostProp,
    LineNumberProp,
    MethodProp,
    PathProp,
    ProtocolProp,
    StageProp,
} from '@lib/telemetry/Props';

import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPRequestOptions, HTTPResponse } from '../HTTP.client';

export const clientHTTPWithLogger: (logger: Logger) => Middleware<HTTPClient> =
    (logger: Logger) =>
    (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options?: HTTPRequestOptions,
                context?: Record<string, string>,
            ): Promise<Result<HTTPResponse, InternalError>> => {
                const {pathname, host} = new URL(url)
                logger.logWithContext(
                    'Info',
                    {
                        [ProtocolProp]: 'web',
                        [StageProp]: 'begin',
                        [HostProp]: host,
                        [MethodProp]: options?.method || 'Get',
                        [PathProp]: pathname,
                        [HeadersProp]: JSON.stringify(options?.headers),
                        [BodyProp]: options?.body
                            ? JSON.stringify(options?.body)
                            : '',
                        [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                        [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
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
                        [ProtocolProp]: 'web',
                        [StageProp]: 'end',
                        [HostProp]: host,
                        [MethodProp]: options?.method || 'Get',
                        [PathProp]: pathname,
                        [HeadersProp]: result?.headers
                            ? JSON.stringify(result.headers)
                            : '',
                        [BodyProp]: result?.body,
                        [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                        [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                    },
                    context,
                );
                return [result, error];
            },
        };
    };
