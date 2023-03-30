import { InternalError } from '@lib/error/errors';
export interface Retry {
    withRetry: (
        context: Record<string, string>,
        execute: () => Promise<InternalError | undefined>,
    ) => Promise<[number, InternalError | undefined]>;
}
