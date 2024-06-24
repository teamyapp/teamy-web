import { RpcOptions } from "@protobuf-ts/runtime-rpc";
import { REQUEST_ID_HEADER } from "../middleware/headers";

export const getContextFromOptions = (options: RpcOptions): Record<string, string> => {
    return {
        requestId: options?.meta?.[REQUEST_ID_HEADER] as string,
    }
}