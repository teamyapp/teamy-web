import {
    MethodInfo,
    NextUnaryFn,
    RpcOptions,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';
import { v4 as uuidv4 } from 'uuid';
import { REQUEST_ID_HEADER } from '../middleware/headers';

export const clientGRPCWithRequestId =
    (
        next: NextUnaryFn,
        method: MethodInfo,
        input: object,
        options: RpcOptions,
    ): UnaryCall => {
        const optionsWithIdentity = {
            ...options,
            meta: {
                ...options?.meta,
                [REQUEST_ID_HEADER]: uuidv4(),
            }
        }

        return next(method, input, optionsWithIdentity);
};