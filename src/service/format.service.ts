import moment from 'moment';

export class FormatService {
    public static getShortName(firstName?: string, lastName?: string): string {
        if (!firstName) {
            return '';
        }
        return `${firstName} ${lastName && `${lastName![0].toUpperCase()}.`}`;
    }

    public static timeFromNow(date: Date): string {
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

    public static dueDate(date: Date): string {
        return moment(date).calendar({
            lastDay: '[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            lastWeek: '[Last] dddd',
            nextWeek: 'dddd',
            sameElse: 'L',
        });
    }
}
