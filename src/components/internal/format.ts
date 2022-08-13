import moment, { DurationInputArg2 } from 'moment';

export enum DURATION {
    '1weeks' = '1weeks',
    '2weeks' = '2weeks',
}

export const DURATION_DESCRIPTIONS: Record<Duration, string> = {
    [DURATION['1weeks']]: '1 week',
    [DURATION['2weeks']]: '2 weeks',
};

export const DURATION_REGEX = /^(\d)+(weeks|days)$/;

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

export function getEndAt(startAt: Date, duration: Duration): Date {
    try {
        const results = duration.match(DURATION_REGEX);
        if (results?.length !== 3) {
            throw Error(`invalid duration format: duration=${duration}`);
        }

        return new Date(startAt.getTime() + moment.duration(+results[1], results[2] as DurationInputArg2).asMilliseconds());
    } catch (e) {
        console.error(e)
        return new Date(startAt.getTime() + moment.duration(1, "weeks").asMilliseconds());
    }
}
