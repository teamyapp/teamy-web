export interface Retry {
	withRetry: (execute: () => Promise<Error | null>) => Promise<[number, Error | null]>
}