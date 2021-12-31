import { deepStrictEqual, fail } from 'assert';

export async function throwsAsync(func: () => Promise<void>, expectedErr: any) {
    try {
        await func();
    } catch (err) {
        deepStrictEqual(err, expectedErr);
        return;
    }
    fail();
}
