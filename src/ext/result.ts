import {Errors} from './errors';

export type Result<Value> = [Value, Errors | null]