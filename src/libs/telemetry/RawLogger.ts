import { Logger } from "./Logger";
import { LogLevel, LogLevelRank } from "./LogLevel";
import { ObsClient } from "./ObsClient";
import { Props, Prop } from "./Props";

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))
const duration = 2000

export class RawLogger implements Logger {
    private logEntries: Props[] = []

    constructor(private visibleLevel: LogLevel, obsClient: ObsClient) {
        this.visibleLevel = visibleLevel;

        (async () => {
            while(true) {
                await wait(duration)
                if (!this.logEntries.length) {
                    continue
                }

                obsClient.uploadLog(this.logEntries)
                this.logEntries = []
            }
        })()
    }

    public log(level: LogLevel, properties: Props) {
        this.logAndSkip(level, properties)
    }
    
    public logAndSkip(level: LogLevel, properties: Props) {
        if (LogLevelRank[level] <= LogLevelRank[this.visibleLevel]) {
            properties = this.withDefaults(level, properties)
            this.logEntries.push(properties)
        }
    }
    
    public logWithContext(ct: Props, level: LogLevel, props: Props) {
        this.logWithContextAndSkip(ct, level, props)
    }

    private withDefaults(level: LogLevel, props: Props): Props {
        return {
            ...props,
            [Prop.HappenAt]: new Date().toUTCString(),
            [Prop.Severity]: level
        }
    }
    
    public logWithContextAndSkip(context: Props, level: LogLevel, properties: Props) {
        this.logAndSkip(level, properties)
    }

}