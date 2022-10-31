import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';

export interface HTTPClient {
    request(
        url: string,
        options?: {
            method: string;
            headers?: Record<string, string>;
            body?: string;
        },
    ): Promise<Result<string, InternalError>>;
}
