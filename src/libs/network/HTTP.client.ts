import { Errors } from '../ext/errors';
import { Result } from '../ext/result';

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
