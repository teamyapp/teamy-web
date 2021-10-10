import _ from 'lodash';
export default class DateService {
    public static getMonthDays(date: Date): (null | number)[] {
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const startWeekDay = monthStart.getDay();

        const days: (null | number)[] = [];
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null);
        }

        const startDay = monthStart.getDate();
        const endDay = monthEnd.getDate();
        return days.concat(_.range(startDay, endDay + 1));
    }
}
