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
}
