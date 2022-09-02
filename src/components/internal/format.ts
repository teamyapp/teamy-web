import moment, { DurationInputArg2 } from 'moment';

type DurationUnit = DurationInputArg2;

export type DurationKey = '1week' | '2weeks';

export type Duration = {
    value: number;
    unit: DurationUnit;
    description: string;
};

export const DURATIONS: Record<DurationKey, Duration> = {
    '1week': {
        value: 1,
        unit: 'w',
        description: '1 week',
    },
    '2weeks': {
        value: 2,
        unit: 'w',
        description: '2 weeks',
    },
};

export function getShortName(firstName?: string, lastName?: string): string {
    if (!firstName) {
        return '';
    }
    return `${firstName} ${lastName && `${lastName![0].toUpperCase()}.`}`;
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
    const { value = 1, unit = 'w' } = DURATIONS[duration] || {};

    return moment(startAt).add(moment.duration(value, unit)).toDate();
}
