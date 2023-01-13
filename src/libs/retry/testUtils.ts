export interface Executable {
    count: number;
    execute: () => Promise<InternalError | undefined>;
}
