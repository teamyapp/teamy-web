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

export type Props = Record<string, any>;
