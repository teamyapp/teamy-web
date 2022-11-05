import { LogLevel } from "./LogLevel";
import { Props } from "./Props";

export interface Logger {
    logWithContext(
        level: LogLevel, props: Props, context?: Record<string, string>
    ): void;
}
