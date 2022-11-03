import { Duration } from '@lib/entity/duration';

import { LOG_LEVEL_RANKS, LogLevel } from './LogLevel';
import { Context, Logger } from './Logger';
import { Props } from './Props';
import { TelemetryClient } from './TelemetryClient';
import { Runtime } from '@lib/runtime/runtime';

const LOG_UPLOAD_INTERVAL = Duration.fromString('T2S');

export class RawLogger implements Logger {
    private logEntries: Props[] = [];

    constructor(
        private visibleLevel: LogLevel,
        private runtime: Runtime,
        telemetryClient: TelemetryClient,
    ) {
        this.visibleLevel = visibleLevel;

        (async () => {
            while (true) {
                await this.runtime.threadSleep(LOG_UPLOAD_INTERVAL);
                if (!this.logEntries.length) {
                    continue;
                }

                telemetryClient.uploadLog(this.logEntries);
                this.logEntries = [];
            }
        })();
    }

    public logWithContext(ct: Context, level: LogLevel, properties: Props) {
        if (LOG_LEVEL_RANKS[level] <= LOG_LEVEL_RANKS[this.visibleLevel]) {
            properties = this.withDefaults(level, properties);
            this.logEntries.push(properties);
        }
    }

    private withDefaults(level: LogLevel, props: Props): Props {
        return {
            ...props,
            HappenAt: new Date().toUTCString(),
            Severity: level,
        };
    }

}
