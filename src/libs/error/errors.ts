import { RpcError } from '@protobuf-ts/runtime-rpc';

export type ErrorCode =
    | 'Unhandled'
    | 'RequestTimeOut'
    | 'BadRequest'
    | 'Unauthenticated'
    | 'NotFound'
    | 'ServiceUnavailable'
    | 'NotImplemented';

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

export const grpcWithErrorHandling = (
    execute: () => Promise<void>,
): (() => Promise<InternalError | undefined>) => {
    return async () => {
        try {
            await execute();
        } catch (err) {
            const rpcError = err as RpcError;
            switch (rpcError.code) {
                case 'CANCELLED':
                    return { errorCode: 'RequestTimeOut' };
                case 'UNKNOWN':
                    return { errorCode: 'Unhandled' };
                case 'INVALID_ARGUMENT':
                    return { errorCode: 'BadRequest' };
                case 'DEADLINE_EXCEEDED':
                    return { errorCode: 'RequestTimeOut' };
                case 'NOT_FOUND':
                    return { errorCode: 'NotFound' };
                case 'PERMISSION_DENIED':
                    return { errorCode: 'Unauthenticated' };
                case 'RESOURCE_EXHAUSTED':
                    return { errorCode: 'ServiceUnavailable' };
                case 'FAILED_PRECONDITION':
                    return { errorCode: 'BadRequest' };
                case 'ABORTED':
                    return { errorCode: 'BadRequest' };
                case 'OUT_OF_RANGE':
                    return { errorCode: 'BadRequest' };
                case 'UNIMPLEMENTED':
                    return { errorCode: 'NotImplemented' };
                case 'INTERNAL':
                    return { errorCode: 'Unhandled' };
                case 'UNAVAILABLE':
                    return { errorCode: 'ServiceUnavailable' };
                case 'DATA_LOSS':
                    return { errorCode: 'Unhandled' };
                default:
                    return { errorCode: 'Unhandled' };
            }
        }
    };
};
