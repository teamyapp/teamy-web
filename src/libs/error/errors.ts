import { RpcError } from '@protobuf-ts/runtime-rpc';

export type ErrorCode =
    | 'Unhandled'
    | 'RequestTimeOut'
    | 'BadRequest'
    | 'Unauthenticated'
    | 'NotFound'
    | 'ServiceUnavailable'
    | 'NotImplemented';

const rpcErrorMap: Record<string, ErrorCode> = {
    CANCELLED: 'RequestTimeOut',
    UNKNOWN: 'Unhandled',
    INVALID_ARGUMENT: 'BadRequest',
    DEADLINE_EXCEEDED: 'RequestTimeOut',
    NOT_FOUND: 'NotFound',
    PERMISSION_DENIED: 'Unauthenticated',
    RESOURCE_EXHAUSTED: 'ServiceUnavailable',
    FAILED_PRECONDITION: 'BadRequest',
    ABORTED: 'BadRequest',
    OUT_OF_RANGE: 'BadRequest',
    UNIMPLEMENTED: 'NotImplemented',
    INTERNAL: 'Unhandled',
    UNAVAILABLE: 'ServiceUnavailable',
    DATA_LOSS: 'Unhandled',
};

export interface InternalError {
    errorCode: ErrorCode;
    message?: string;
}

export type ErrorCategory = 'Transient' | 'Outage' | 'ClientInteraction';

const ERROR_CATEGORIES: Record<ErrorCode, ErrorCategory> = {
    RequestTimeOut: 'Transient',
    Unhandled: 'Outage',
    ServiceUnavailable: 'Outage',
    NotImplemented: 'Outage',
    BadRequest: 'ClientInteraction',
    Unauthenticated: 'ClientInteraction',
    NotFound: 'ClientInteraction',
};

export const getErrCategory = (err: InternalError): ErrorCategory => {
    return ERROR_CATEGORIES[err.errorCode] || 'Outage';
};

export const rpcWithError = (
    execute: () => Promise<void>,
): (() => Promise<InternalError | undefined>) => {
    return async () => {
        try {
            await execute();
        } catch (err) {
            const rpcError = err as RpcError;
            const errorCode = rpcErrorMap[rpcError.code] || 'Unhandled';
            return { errorCode, message: rpcError.message };
        }
    };
};
