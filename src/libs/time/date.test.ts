import { strictEqual } from 'assert';
import moment from 'moment';
import { test } from 'vitest';

import { getEndOfDay } from './date';

test('getEndOfDay should return correct end moment', () => {
    const startAt = moment.utc('2020-01-01T10:00:00.000Z');
    const endMoment = getEndOfDay(startAt);
    strictEqual(endMoment.toISOString(), '2020-01-02T00:00:00.000Z');
});
