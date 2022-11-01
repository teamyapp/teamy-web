export enum Errors {
    Unknown,
    SessionIdInUse,
    RequestTimeOut,
    BadRequest,
    Unauthenticated,
    NotFound,
    ServiceUnavailable,
    ServerInternalError,
    NotImplemented,
}

export class InternalError extends Error {
    constructor(public errors: Errors, public message: string = '') {
        super(message);
    }
}
