import { InternalError } from '@lib/error/errors';

export interface Retry {
    withRetry: (
        execute: () => Promise<InternalError | undefined>,
    ) => Promise<[number, InternalError | undefined]>;
}

export interface Executable {
    count: number,
    execute: () => Promise<InternalError | undefined>,
}