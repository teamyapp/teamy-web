import { throwsAsync } from '@lib/testing/assert';
import { strictEqual } from 'assert';
import { after, chan, select, sleep } from './csp';

describe('select on read/receive/pop operation', () => {
    it('works', async () => {
        let sec1 = chan<string>();
        sec1.put('put after unblock');
        let x = await select([[sec1, async (ele) => ele]]);
        strictEqual('put after unblock', x);
    });
    it('works 2', async () => {
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<string>();
        setTimeout(async () => {
            sec1.put('sec1');
        }, 1000);
        let x = await select([
            [
                sec1,
                async function (ele) {
                    return ele;
                },
            ],
            [
                unblock,
                async function (ele) {
                    return ele;
                },
            ],
        ]);
        strictEqual(undefined, x);
    });
    it('can select from a channel that will be closed later', async () => {
        let unblock = chan<null>();
        setTimeout(async () => {
            unblock.close();
        }, 100);
        let x = await select([
            [
                unblock,
                async function (ele) {
                    return ele;
                },
            ],
        ]);
        strictEqual(undefined, x);
    });
    it('can select from a channel that will be put later', async () => {
        let unblock = chan<string>();
        setTimeout(async () => {
            unblock.put('put 1 sec later');
        }, 100);
        let x = await select([
            [
                unblock,
                async function (ele) {
                    return ele;
                },
            ],
        ]);
        strictEqual('put 1 sec later', x);
    });

    it('can pop from unselected channels', async () => {
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<string>();
        let t1 = async () => {
            await sleep(100);
            await sec1.put('sec1');
        };
        t1();
        strictEqual(
            'unblock',
            await select([
                [
                    unblock,
                    async function () {
                        return 'unblock';
                    },
                ],
                [
                    sec1,
                    async function (ele) {
                        return ele;
                    },
                ],
            ]),
        );
        strictEqual('sec1', await sec1.pop());
    });

    it('returns in order', async () => {
        let unblock = chan<null>();
        unblock.put(null);
        let sec1 = chan<string>();
        sec1.put('put after unblock');
        let x = await select([
            [sec1, async (ele) => ele],
            // [unblock, async () => 'unblock' ]
        ]);
        strictEqual('put after unblock', x);
    });

    xit('favors channels with values ready to be received over closed channels', async () => {
        // Currently does not support, but
        // Is this even a good design decision?
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<null>();
        sec1.put(null);
        let x = await select([
            [
                sec1,
                async function () {
                    return 'sec1';
                },
            ],
            [
                unblock,
                async function () {
                    return 'unblock';
                },
            ],
        ]);
        strictEqual('sec1', x);
    });

    xit('fair selections --> no starvation', async () => {
        // Currently does not support, but
        // Is this even a good design decision?
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<null>();
        sec1.put(null);
        while (1) {
            let x = await select([
                [
                    unblock,
                    async function () {
                        return 'unblock';
                    },
                ],
                [
                    sec1,
                    async function () {
                        return 'sec1';
                    },
                ],
            ]);
            if ('sec1' === x) {
                // should eventually get picked
                break;
            }
        }
    });

    it('has default case', async () => {
        let unblock = chan<null>();
        strictEqual(
            'default',
            await select(
                [
                    [
                        unblock,
                        async function () {
                            return 'unblock';
                        },
                    ],
                ],
                async function () {
                    return 'default';
                },
            ),
        );
    });
    it("won't trigger default case if the normal case is ready", async () => {
        let unblock = chan<null>();
        unblock.close();
        strictEqual(
            await select(
                [
                    [
                        unblock,
                        async function () {
                            return 'unblock';
                        },
                    ],
                ],
                async function () {
                    return 'default';
                },
            ),
            'unblock',
        );
        strictEqual(0, unblock.popActions.length);
        strictEqual(0, unblock.putActions.length);
        strictEqual(0, unblock.readyListener.length);
    });
    it("won't trigger default case if the normal case is ready 2", async () => {
        let unblock = chan<string>();
        unblock.put('something');
        strictEqual(
            await select(
                [
                    [
                        unblock,
                        async function (ele) {
                            return ele;
                        },
                    ],
                ],
                async function () {
                    return 'default';
                },
            ),
            'something',
        );
    });

    it('after', async () => {
        await throwsAsync(async () => {
            await after(2147483648);
        }, new Error('2147483648 is out of signed int32 bound or is negative'));
    });

    it('do not starve in an infinite loop', async () => {
        let c = after(10);
        let i = 0;
        while (++i) {
            let ret = await select(
                [
                    [
                        c,
                        async () => {
                            return 'after';
                        },
                    ],
                ],
                async () => {
                    // console.log(i);
                    return 'default';
                },
            );
            if (ret === 'after') {
                break;
            }
        }
    });
});
