import moment, { Moment } from 'moment';

export interface Year {
    yearOf: number;
    totalDays: number;
    includeStart: boolean;
    includeEnd: boolean;
}

export interface Month {
    monthOfYear: number;
    totalDays: number;
    includeStart: boolean;
    includeEnd: boolean;
}

export interface Week {
    weekOfYear: number;
    totalDays: number;
    includeStart: boolean;
    includeEnd: boolean;
}

export interface Day {
    dayOfMonth: number;
    dayOfWeek: number;
    includeStart: boolean;
    includeEnd: boolean;
}

export function getEndOfDay(endAt: Moment): Moment {
    const shouldAddOneDay =
        endAt.hours() > 0 ||
        endAt.minutes() > 0 ||
        endAt.seconds() > 0 ||
        endAt.milliseconds() > 0;
    endAt = endAt.startOf('day');
    if (shouldAddOneDay) {
        endAt = endAt.add(1, 'day');
    }

    return endAt;
}

export function getDaysBetween(startAt: Moment, endAt: Moment): Day[] {
    endAt = getEndOfDay(endAt);
    const totalDays = endAt.diff(startAt, 'days');
    let days: Day[] = [];
    for (let index = 0; index < totalDays; index++) {
        let dayMoment = startAt.clone().add(index, 'day');
        days.push({
            dayOfMonth: dayMoment.date(),
            dayOfWeek: dayMoment.isoWeekday(),
            includeStart: true,
            includeEnd: true,
        });
    }

    return days;
}

export function getWeeksBetween(startAt: Moment, endAt: Moment): Week[] {
    endAt = getEndOfDay(endAt);
    let remainingDaysAfterWeeks = endAt.diff(startAt, 'days');
    let weekStartDate = startAt.isoWeekday();
    let weeks: Week[] = [];
    for (let index = 0; remainingDaysAfterWeeks > 0; index++) {
        let weekMoment = startAt.clone().add(index, 'week');
        let daysInWeek = Math.min(7, remainingDaysAfterWeeks);
        daysInWeek = daysInWeek - weekStartDate + 1;
        weeks.push({
            weekOfYear: weekMoment.isoWeek(),
            totalDays: daysInWeek,
            includeStart: weekStartDate == 1,
            includeEnd: daysInWeek == 7,
        });
        weekStartDate = 1;
        remainingDaysAfterWeeks -= daysInWeek;
    }

    return weeks;
}

export function getMonthsBetween(startAt: Moment, endAt: Moment): Month[] {
    endAt = getEndOfDay(endAt);
    let monthStartDate = startAt.date();
    let remainingDaysAfterMonths = endAt.diff(startAt, 'days');
    let months: Month[] = [];
    for (let index = 0; remainingDaysAfterMonths > 0; index++) {
        let monthMoment = startAt.clone().add(index, 'month');
        let maxDaysInMonth = monthMoment.daysInMonth() - monthStartDate + 1;
        let daysInMonth = Math.min(maxDaysInMonth, remainingDaysAfterMonths);
        months.push({
            monthOfYear: monthMoment.month() + 1,
            totalDays: daysInMonth,
            includeStart: monthStartDate == 1,
            includeEnd: daysInMonth == maxDaysInMonth,
        });
        monthStartDate = 1;
        remainingDaysAfterMonths -= daysInMonth;
    }

    return months;
}

export function getYearsBetween(startAt: Moment, endAt: Moment): Year[] {
    endAt = getEndOfDay(endAt);
    let yearStartDate = startAt.dayOfYear();
    let remainingDaysAfterYears = endAt.diff(startAt, 'days');
    let years: Year[] = [];
    for (let index = 0; remainingDaysAfterYears > 0; index++) {
        let yearMoment = startAt.clone().add(index, 'year');
        let totalDaysInYear = yearMoment.isLeapYear() ? 366 : 365;
        let maxDaysInYear = totalDaysInYear - yearStartDate + 1;
        let daysInYear = Math.min(maxDaysInYear, remainingDaysAfterYears);
        years.push({
            yearOf: yearMoment.year(),
            totalDays: daysInYear,
            includeStart: yearStartDate == 1,
            includeEnd: daysInYear == maxDaysInYear,
        });
        yearStartDate = 1;
        remainingDaysAfterYears -= daysInYear;
    }

    return years;
}

export function formatDate(date: Date | undefined): string {
    return date ? moment(date).format('MM/DD/YYYY h:mm:ss') : '';
}

