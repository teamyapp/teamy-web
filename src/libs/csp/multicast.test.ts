import { strictEqual } from 'assert';
import { chan, multi, sleep } from './csp';

describe('Multi Cast of Channels', () => {
    // TODO: fix 'A closed channel can never be put' error
    xit('works', async () => {
        let c = chan();
        // @ts-ignore
        let multicaster = multi(c);
        let c1 = multicaster.copy();
        let c2 = multicaster.copy();
        let c3 = multicaster.copy();
        for (let i = 0; i < 100; i++) {
            c.put(i);
            strictEqual(i, await c1.pop());
            strictEqual(i, await c2.pop());
            strictEqual(i, await c3.pop());
        }
        c.close();
        await sleep(0);
        strictEqual(true, c1.closed());
        strictEqual(true, c2.closed());
        strictEqual(true, c3.closed());
    });
});
