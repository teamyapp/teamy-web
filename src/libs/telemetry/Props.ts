import { PartialRecord } from "@lib/types";

export type Prop =
    | 'Body'
    | 'Method'
    | 'Headers'
    | 'Cause'
    | 'Message'
    | 'HappenAt'
    | 'Severity'
    | 'FileName'
    | 'LineNumber'
    | 'ServiceName'
    | 'RequestId';

export type Props = PartialRecord<string, any>;
