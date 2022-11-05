import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Logger } from '@lib/telemetry/Logger';
import { BodyProp, CauseProp, FileNameProp, HeadersProp, LineNumberProp, MethodProp } from '@lib/telemetry/Props';
import { Middleware } from '../../middleware/middleware';
import { HTTPClient, HTTPResponse } from '../HTTP.client';

export const clientHTTPWithLogger: (logger: Logger) => Middleware<HTTPClient> =
    (logger: Logger) =>
    (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url,
                options,
                context,
            ): Promise<Result<HTTPResponse, InternalError>> => {
                logger.logWithContext('Info', {
                    [HeadersProp]: JSON.stringify(options?.headers),
                    [MethodProp]: options?.method || "Get",
                    [BodyProp]: options?.body ? JSON.stringify(options?.body) : "",
                    [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                    [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                }, context);
                const [result, error] = await httpClient.request(url, options, context);
                logger.logWithContext(error ? 'Error' : 'Info', {
                    [HeadersProp]: result?.header ? JSON.stringify(result.header) : "",
                    [MethodProp]: options?.method || 'Get',
                    [BodyProp]: result?.body,
                    [CauseProp]: error,
                    [FileNameProp]: 'COMPILE_TIME_INJECT_FILENAME',
                    [LineNumberProp]: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                }, context);
                return [result, error]
            },
        };
    };
