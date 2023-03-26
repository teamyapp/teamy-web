import { InternalError } from '@lib/error/errors';
export interface Retry {
    withRetry: (
        execute: () => Promise<InternalError | undefined>,
        context?: Record<string, string>,
    ) => Promise<[number, InternalError | undefined]>;
}
