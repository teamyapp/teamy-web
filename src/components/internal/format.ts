import moment, { DurationInputArg2 } from 'moment';

type DurationUnit = DurationInputArg2

export type DurationKey = 
| '1week'
| '2weeks';


export type Duration = {
    value: number,
    unit: DurationUnit,
    description: string
}

export const DURATION_KEY_OBJECT: Record<DurationKey, Duration> = {
    '1week': {
        value: 1,
        unit: 'w',
        description: '1 week'
    },
    '2weeks': {
        value: 2,
        unit: 'w',
        description: '2 weeks'
    }
}

export function getShortName(firstName?: string, lastName?: string): string {
    if (!firstName) {
        return '';
    }
    return `${firstName} ${lastName && `${lastName![0].toUpperCase()}.`}`;
}

export function timeFromNow(date: Date): string {
    const momentDate = moment(date);
    const now = moment(Date.now());
    let format;
    if (momentDate.isSame(now, 'day')) {
        format = 'h:mm:ss a';
    } else if (Math.abs(momentDate.diff(now, 'days')) < 7) {
        format = 'h:mm:ss a, dddd';
    } else if (momentDate.isSame(now, 'year')) {
        format = 'h:mm:ss a, MM/DD';
    } else {
        format = 'h:mm:ss a, MM/DD/YYYY';
    }
    return momentDate.format(format);
}

export function dueDate(date: Date): string {
    return moment(date).calendar({
        lastDay: '[Yesterday]',
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        lastWeek: '[Last] dddd',
        nextWeek: 'dddd',
        sameElse: 'L',
    });
}

export function getSprintName(startAt: Date): string {
    return moment(startAt).format('YYYY-MM-DD');
}

export function getEndAt(startAt: Date, duration: DurationKey): Date {
    const {value = 1, unit = "w"} = DURATION_KEY_OBJECT[duration] || {}

    return moment(startAt).add(moment.duration(value, unit)).toDate();
}
