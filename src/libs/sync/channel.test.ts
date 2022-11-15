import { strictEqual } from 'assert';

import { Channel } from '@lib/sync/channel';

describe('Buffered Channel', () => {
    test('send value when buffer has space', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        await channel.send(2);
        strictEqual(channel.length(), 2);
    });

    test('send value when buffer is empty with waiting receivers', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            const [item1] = await channel.receive();
            strictEqual(item1, 1);
            strictEqual(channel.length(), 0);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 0);
            const [item2] = await channel.receive();
            strictEqual(item2, 2);
            strictEqual(channel.length(), 0);
        })().then();

        await new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 500);
        });

        strictEqual(channel.length(), 0);
        await channel.send(1);
        strictEqual(channel.length(), 0);

        strictEqual(channel.length(), 0);
        await channel.send(2);
        strictEqual(channel.length(), 0);
    });

    test('send value when buffer is full without pending receiver', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        await channel.send(2);
        strictEqual(channel.length(), 2);

        await channel.send(3);
        strictEqual(channel.length(), 3);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 4);
            const [item1] = await channel.receive();
            strictEqual(item1, 1);
            strictEqual(channel.length(), 4);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 4);
            const [item2] = await channel.receive();
            strictEqual(item2, 2);
            strictEqual(channel.length(), 3);
        })().then();

        await channel.send(4);
        strictEqual(channel.length(), 3);

        await channel.send(5);
        strictEqual(channel.length(), 3);
    });

    test('receive value when buffer has item', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        await channel.send(2);
        strictEqual(channel.length(), 2);

        const [item1] = await channel.receive();
        strictEqual(item1, 1);
        strictEqual(channel.length(), 1);

        const [item2] = await channel.receive();
        strictEqual(item2, 2);
        strictEqual(channel.length(), 0);
    });

    test('receive value with buffer is empty without pending sender', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            await channel.send(1);
            strictEqual(channel.length(), 0);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 0);
            await channel.send(2);
            strictEqual(channel.length(), 0);
        })().then();

        const [item1] = await channel.receive();
        strictEqual(item1, 1);
        strictEqual(channel.length(), 0);

        const [item2] = await channel.receive();
        strictEqual(item2, 2);
        strictEqual(channel.length(), 0);
    });

    test('receive value with buffer is empty with pending senders', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            await channel.send(1);
            strictEqual(channel.length(), 1);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 1);
            await channel.send(2);
            strictEqual(channel.length(), 2);
        })().then();

        await new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 500);
        });

        strictEqual(channel.length(), 2);
        const [item1] = await channel.receive();
        strictEqual(item1, 1);
        strictEqual(channel.length(), 1);

        const [item2] = await channel.receive();
        strictEqual(item2, 2);
        strictEqual(channel.length(), 0);
    });

    test('cannot send after channel is closed', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        channel.close();

        const succeed = await channel.send(2);
        strictEqual(succeed, false);
    });

    test('cannot send after channel is closed', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        await channel.send(1);
        strictEqual(channel.length(), 2);

        await channel.receive();
        strictEqual(channel.length(), 1);

        channel.close();

        const [value, succeed] = await channel.receive();
        strictEqual(succeed, false);
    });

    test('pending send after channel is closed', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });

            const succeed = await channel.send(2);
            strictEqual(succeed, false);
        })().then();

        channel.close();
    });

    test('pending receive after channel is closed', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);

        await channel.send(1);
        strictEqual(channel.length(), 1);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });

            const [val, succeed] = await channel.receive();
            strictEqual(succeed, false);
        })().then();

        channel.close();
    });

    test('iterate channel values', async () => {
        const channel = new Channel<number>(3);
        strictEqual(channel.length(), 0);
        const expectedValues: number[] = [1, 2, 3, 4, 5];
        let expectedNextValueIndex = 0;

        (async () => {
            for (let index = 0; index < 5; index++) {
                await new Promise<void>((resolve, reject) => {
                    setTimeout(resolve, 100);
                });

                let succeed = await channel.send(index + 1);
                strictEqual(succeed, true);
            }

            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            channel.close();
        })().then();

        for await (let value of channel) {
            strictEqual(value, expectedValues[expectedNextValueIndex]);
            expectedNextValueIndex++;
            strictEqual(channel.isClosed(), false);
        }

        strictEqual(channel.isClosed(), true);
    });
});

describe('Unbuffered Channel', () => {
    test('send value without waiting receiver', async () => {
        const channel = new Channel<number>();
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });

            strictEqual(channel.length(), 1);
            const [item1] = await channel.receive();
            strictEqual(item1, 1);
            strictEqual(channel.length(), 1);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 1);
            const [item2] = await channel.receive();
            strictEqual(item2, 2);
            strictEqual(channel.length(), 0);
        })().then();

        await channel.send(1);
        strictEqual(channel.length(), 0);

        await channel.send(2);
        strictEqual(channel.length(), 0);
    });

    test('send value with waiting receivers', async () => {
        const channel = new Channel<number>(0);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            const [item1] = await channel.receive();
            strictEqual(item1, 1);
            strictEqual(channel.length(), 0);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 0);
            const [item2] = await channel.receive();
            strictEqual(item2, 2);
            strictEqual(channel.length(), 0);
        })().then();

        await new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 500);
        });

        strictEqual(channel.length(), 0);
        await channel.send(1);
        strictEqual(channel.length(), 0);

        strictEqual(channel.length(), 0);
        await channel.send(2);
        strictEqual(channel.length(), 0);
    });

    test('receive value without pending sender', async () => {
        const channel = new Channel<number>(0);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            await channel.send(1);
            strictEqual(channel.length(), 0);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 0);
            await channel.send(2);
            strictEqual(channel.length(), 0);
        })().then();

        const [item1] = await channel.receive();
        strictEqual(item1, 1);
        strictEqual(channel.length(), 0);

        const [item2] = await channel.receive();
        strictEqual(item2, 2);
        strictEqual(channel.length(), 0);
    });

    test('receive value with pending senders', async () => {
        const channel = new Channel<number>(0);
        strictEqual(channel.length(), 0);

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 100);
            });
            strictEqual(channel.length(), 0);
            await channel.send(1);
            strictEqual(channel.length(), 1);
        })().then();

        (async () => {
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 200);
            });
            strictEqual(channel.length(), 1);
            await channel.send(2);
            strictEqual(channel.length(), 2);
        })().then();

        await new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 500);
        });

        strictEqual(channel.length(), 2);
        const [item1] = await channel.receive();
        strictEqual(item1, 1);
        strictEqual(channel.length(), 1);

        const [item2] = await channel.receive();
        strictEqual(item2, 2);
        strictEqual(channel.length(), 0);
    });
});
