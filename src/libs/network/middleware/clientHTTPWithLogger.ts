import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { Logger } from '@lib/telemetry/Logger';
import { Middleware } from '../../middleware/middleware';
import { Context, HTTPClient } from '../HTTP.client';

export const clientHTTPWithLogger: (logger: Logger) => Middleware<HTTPClient> =
    (logger: Logger) =>
    (httpClient: HTTPClient): HTTPClient => {
        return {
            request: async (
                url: string,
                options,
                context: Context = {},
            ): Promise<Result<string, InternalError>> => {
                logger.logWithContext(context, 'Info', {
                    Headers: JSON.stringify(options?.headers),
                    Method: options?.method || "Get",
                    Body: options?.body ? JSON.stringify(options?.body) : "",
                    FileName: 'COMPILE_TIME_INJECT_FILENAME',
                    LineNumber: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                });
                const [res, resHeaders, error] = await httpClient.request(url, options, context);
                logger.logWithContext(context, error ? 'Error' : 'Info', {
                    Headers: headers ? JSON.stringify(headers) : "",
                    Method: options?.method || 'Get',
                    Body: res,
                    Cause: error,
                    FileName: 'COMPILE_TIME_INJECT_FILENAME',
                    LineNumber: 'COMPILE_TIME_INJECT_LINE_NUMBER',
                });
                return [res, headers, error]
            },
        };
    };
