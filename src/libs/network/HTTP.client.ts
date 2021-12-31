import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';

export interface HTTPClient {
    request(
        url: string,
        options?: {
            method: string;
            headers?: { [key: string]: string };
            body?: string;
        },
    ): Promise<Result<string, Errors>>;
}
