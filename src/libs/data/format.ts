import moment from 'moment';

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

export function today(): Date {
    const date = new Date();
    date.setHours(0);
    date.setUTCMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}
