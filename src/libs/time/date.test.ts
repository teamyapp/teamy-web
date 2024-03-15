import { deepEqual, strictEqual } from 'assert';
import moment from 'moment';
import { test } from 'vitest';

import {
    Year,
    getDaysBetween,
    getEndOfDay,
    getMonthsBetween,
    getYearsBetween,
} from './date';

test('getEndOfDay should return correct end moment', () => {
    const startAt = moment.utc('2020-01-01T10:00:00.000Z');
    const endMoment = getEndOfDay(startAt);
    deepEqual(endMoment.toISOString(), '2020-01-02T00:00:00.000Z');
});

test('getDaysBetween should return correct days', () => {
    const startAt = moment('2023-12-19 00:00:00', 'YYYY-MM-DD hh:mm:ss');
    const endAt = moment('2024-1-10 23:59:59', 'YYYY-MM-DD hh:mm:ss');
    const days = getDaysBetween(startAt, endAt);
    deepEqual(days.length, 23);
    deepEqual(days[0], {
        dayOfMonth: 19,
        dayOfWeek: 2,
        includeStart: true,
        includeEnd: true,
    });
    deepEqual(days[22], {
        dayOfMonth: 10,
        dayOfWeek: 3,
        includeStart: true,
        includeEnd: true,
    });
});

test('getMonthsBetween should return correct months', () => {
    const startAt = moment('2023-11-19 00:00:00', 'YYYY-MM-DD hh:mm:ss');
    const endAt = moment('2023-11-30 23:59:59', 'YYYY-MM-DD hh:mm:ss');
    const months = getMonthsBetween(startAt, endAt);
    deepEqual(months.length, 1);
    deepEqual(months[0], {
        monthOfYear: 11,
        totalDays: 12,
        includeStart: false,
        includeEnd: true,
    });
});

test('getYearsBetween should return correct years', () => {
    const startAt = moment('2023-11-19 00:00:00', 'YYYY-MM-DD hh:mm:ss');
    const endAt = moment('2023-11-30 23:59:59', 'YYYY-MM-DD hh:mm:ss');
    const years = getYearsBetween(startAt, endAt);
    deepEqual(years.length, 1);
    deepEqual(years[0], {
        yearOf: 2023,
        totalDays: 12,
        includeStart: false,
        includeEnd: false,
    });
});
