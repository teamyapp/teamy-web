import { LogLevel } from "./LogLevel";
import { Props } from "./Props";

export interface Context {
    requestId?: string
    clientId?: string
}

export interface Logger {
    logWithContext(
        context: Context, level: LogLevel, props: Props
    ): void;
}
