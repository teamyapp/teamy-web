import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';

export interface HTTPResponse {
    body: string | null;
    headers: Record<string, string>;
    statusCode: number;
}
export interface HTTPClient {
    request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
        context?: Record<string, string>,
    ): Promise<Result<HTTPResponse, InternalError>>;
}
