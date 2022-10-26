export interface Retry {
    withRetry: (
        execute: () => Promise<Error | undefined>,
    ) => Promise<[number, Error | undefined]>;
}
