import {
    MethodInfo,
    NextUnaryFn,
    RpcOptions,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';
import { getAccessToken } from '@lib/identity/Identity.client';

export const clientGRPCWithIdentity =
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
                Authorization: getAccessToken(),
            }
        }

        return next(method, input, optionsWithIdentity);
};