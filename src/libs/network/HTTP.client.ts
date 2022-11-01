import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';


export interface Context {
    requestId?: string
    serviceName?: string
}

export interface HTTPClient {
    request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
        context?: Context
    ): Promise<Result<string, InternalError>>;
}
