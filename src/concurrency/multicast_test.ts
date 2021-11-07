/**
 * @author CreatCodeBuild
 * @version Nov 06, 2021
 * @SLA maintained by CreatCodeBuild for bug fix & new features
 */

import { chan, multi, sleep } from './csp';
import { equal } from 'assert';

describe('Multi Cast of Channels', () => {
    it('works', async () => {
        let c = chan();
        // @ts-ignore
        let multicaster = multi(c);
        let c1 = multicaster.copy();
        let c2 = multicaster.copy();
        let c3 = multicaster.copy();
        for (let i = 0; i < 100; i++) {
            c.put(i);
            equal(i, await c1.pop());
            equal(i, await c2.pop());
            equal(i, await c3.pop());
        }
        c.close();
        await sleep(0);
        equal(true, c1.closed());
        equal(true, c2.closed());
        equal(true, c3.closed());
    });
});
