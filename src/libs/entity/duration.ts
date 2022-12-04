import moment from 'moment';

const SECOND_IN_MILLIS = 1000;
const MINUTE_IN_MILLIS = 60 * SECOND_IN_MILLIS;
const HOUR_IN_MILLIS = 60 * MINUTE_IN_MILLIS;
const DAY_IN_MILLIS = 24 * HOUR_IN_MILLIS;
const WEEK_IN_MILLIS = 7 * DAY_IN_MILLIS;
const MONTH_IN_MILLIS = 30 * DAY_IN_MILLIS;
const YEAR_IN_MILLIS = 365 * DAY_IN_MILLIS;
export const MILLIS_IN_NANOS = 1_000_000;

interface DurationJson {
    sign?: number;
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

export class Duration {
    private readonly _years: number;
    private readonly _months: number;
    private readonly _weeks: number;
    private readonly _days: number;
    private readonly _hours: number;
    private readonly _minutes: number;
    private readonly _seconds: number;

    constructor(private _totalMilliSeconds: number) {
        let tmpTotalMillis = Math.abs(_totalMilliSeconds);
        this._years = Math.floor(tmpTotalMillis / YEAR_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % YEAR_IN_MILLIS;
        this._months = Math.floor(tmpTotalMillis / MONTH_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % MONTH_IN_MILLIS;
        this._weeks = Math.floor(tmpTotalMillis / WEEK_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % WEEK_IN_MILLIS;
        this._days = Math.floor(tmpTotalMillis / DAY_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % DAY_IN_MILLIS;
        this._hours = Math.floor(tmpTotalMillis / HOUR_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % HOUR_IN_MILLIS;
        this._minutes = Math.floor(tmpTotalMillis / MINUTE_IN_MILLIS);
        tmpTotalMillis = tmpTotalMillis % MINUTE_IN_MILLIS;
        this._seconds = Math.floor(tmpTotalMillis / SECOND_IN_MILLIS);
    }

    public static fromJson(json: DurationJson): Duration {
        const sign = json.sign || 1;
        let totalMillis = (json.years || 0) * YEAR_IN_MILLIS;
        totalMillis += (json.months || 0) * MONTH_IN_MILLIS;
        totalMillis += (json.weeks || 0) * WEEK_IN_MILLIS;
        totalMillis += (json.days || 0) * DAY_IN_MILLIS;
        totalMillis += (json.hours || 0) * HOUR_IN_MILLIS;
        totalMillis += (json.minutes || 0) * MINUTE_IN_MILLIS;
        totalMillis += (json.seconds || 0) * SECOND_IN_MILLIS;
        return new Duration(sign * totalMillis);
    }

    public static fromString(durationText: string): Duration {
        const totalMillis = moment.duration(durationText).asMilliseconds();
        return new Duration(totalMillis);
    }

    public static fromMicroSeconds(microSeconds: number): Duration {
        return new Duration(microSeconds / 1000);
    }

    public get years(): number {
        return this._years;
    }

    public get months(): number {
        return this._months;
    }

    public get weeks(): number {
        return this._weeks;
    }

    public get days(): number {
        return this._days;
    }

    public get hours(): number {
        return this._hours;
    }

    public get minutes(): number {
        return this._minutes;
    }

    public get seconds(): number {
        return this._seconds;
    }

    public get totalMilliSeconds(): number {
        return this._totalMilliSeconds;
    }

    public add(other: Duration): Duration {
        return new Duration(this.totalMilliSeconds + other.totalMilliSeconds);
    }

    public subtract(other: Duration): Duration {
        return new Duration(this.totalMilliSeconds - other.totalMilliSeconds);
    }

    public toString(): string {
        return moment.duration(this.totalMilliSeconds).toISOString();
    }

    public toReadable(): string {
        if (this._totalMilliSeconds === 0) {
            return '0';
        }

        const buffer: string[] = [];
        tryIncludeUnit(buffer, this.years, 'y');
        tryIncludeUnit(buffer, this.months, 'mo');
        tryIncludeUnit(buffer, this.weeks, 'w');
        tryIncludeUnit(buffer, this.days, 'd');
        tryIncludeUnit(buffer, this.hours, 'h');
        tryIncludeUnit(buffer, this.minutes, 'min');
        tryIncludeUnit(buffer, this.seconds, 's');
        let readableValue = buffer.join(' ');

        if (this._totalMilliSeconds < 0) {
            return `-${readableValue}`;
        }

        return readableValue;
    }
}

function tryIncludeUnit(buffer: string[], count: number, unit: string) {
    if (count > 0) {
        buffer.push(`${count}${unit}`);
    }
}
