import { InternalError } from '@lib/error/errors';

export interface Executable {
    count: number;
    execute: () => Promise<InternalError | undefined>;
}
