export interface Retry {
    withRetry: (
        execute: () => Promise<InternalError | undefined>,
    ) => Promise<[number, InternalError | undefined]>;
}
