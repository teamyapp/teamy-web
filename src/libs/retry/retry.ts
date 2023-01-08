import { InternalError } from '@lib/error/errors';

export interface Retry {
    withRetry: (
        execute: () => Promise<[InternalError, boolean] | undefined>,
    ) => Promise<[number, InternalError | undefined]>;
}
