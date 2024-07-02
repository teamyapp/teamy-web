import { Logger } from '@lib/telemetry/Logger';
import {
    BodyProp,
    CauseProp,
    FileNameProp,
    HeadersProp,
    HostProp,
    LineNumberProp,
    MethodProp,
    PathProp,
    ProtocolProp,
    StageProp,
} from '@lib/telemetry/Props';

import {
    MethodInfo,
    NextUnaryFn,
    RpcOptions,
    RpcError,
    UnaryCall,
} from '@protobuf-ts/runtime-rpc';
import { getContextFromOptions } from './context';

export const clientGRPCWithLogger =
    (logger: Logger) =>
    (
        next: NextUnaryFn,
        method: MethodInfo,
        input: object,
        options: RpcOptions,
    ): UnaryCall => {
        const context = getContextFromOptions(options);
        logger.logWithContext(
            'Info',
            {
                [ProtocolProp]: 'grpc',
                [StageProp]: 'begin',
                [HostProp]: method.service.typeName,
                [MethodProp]: method.name,
                [HeadersProp]: JSON.stringify(options?.meta),
                [BodyProp]: input ? JSON.stringify(input) : '',
                [FileNameProp]: BUILD_INJECT_FILE_PATH,
                [LineNumberProp]: BUILD_INJECT_LINE_NUMBER,
            },
            context,
        );

        const nextFn = next(method, input, options);
        nextFn
            .then((response) => {
                logger.logWithContext(
                    'Info',
                    {
                        [ProtocolProp]: 'grpc',
                        [StageProp]: 'end',
                        [HostProp]: method.service.typeName,
                        [MethodProp]: method.name,
                        [HeadersProp]: JSON.stringify(response.headers),
                        [BodyProp]: response.response,
                        [FileNameProp]: BUILD_INJECT_FILE_PATH,
                        [LineNumberProp]: BUILD_INJECT_LINE_NUMBER,
                    },
                    context,
                );
                return response;
            })
            .catch((error: RpcError) => {
                logger.logWithContext(
                    'Error',
                    {
                        [CauseProp]: error.cause,
                    },
                    {},
                );
                return error;
            });
        return nextFn;
    };
