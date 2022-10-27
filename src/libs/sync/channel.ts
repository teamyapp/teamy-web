interface PausedSendTask<Item> {
    resume: (succeed: boolean) => void;
    item: Item;
}

interface PausedReceiveTask<Item> {
    resume: (itemAndClosed: [Item | undefined, boolean]) => void;
}

export interface SendChannel<Item> {
    send(item: Item): Promise<boolean>;
    isClosed(): boolean;
    length(): number;
}

export interface ReceiveChannel<Item> extends AsyncIterable<Item>{
    receive(): Promise<[Item | undefined, boolean]>;
    isClosed(): boolean;
    length(): number;
}

export class Channel<Item> implements SendChannel<Item>, ReceiveChannel<Item> {
    private _isClosed: boolean;
    private buffer: Item[];
    private sendQueue: PausedSendTask<Item>[];
    private receiveQueue: PausedReceiveTask<Item>[];

    constructor(private bufferSize: number = 0) {
        this.buffer = [];
        this.sendQueue = [];
        this.receiveQueue = [];
        this._isClosed = false;
    }

    public send(item: Item): Promise<boolean> {
        if (this._isClosed) {
            return Promise.resolve(false);
        }

        if (this.receiveQueue.length > 0) {
            const pausedReceiveTask = this.receiveQueue[0];
            this.receiveQueue = this.receiveQueue.slice(1);
            pausedReceiveTask.resume([item, true]);
            return Promise.resolve(true);
        }

        if (this.buffer.length < this.bufferSize) {
            this.buffer = this.buffer.concat(item);
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            this.sendQueue = this.sendQueue.concat({
                resume: () => {
                    resolve(true);
                },
                item: item
            });
        });
    }

    public receive(): Promise<[Item | undefined, boolean]> {
        if (this._isClosed) {
            return Promise.resolve([undefined, false]);
        }

        if (this.buffer.length > 0) {
            const item = this.buffer[0];
            this.buffer = this.buffer.slice(1);
            if (this.sendQueue.length > 0) {
                const pausedSendTask = this.sendQueue[0];
                this.sendQueue = this.sendQueue.slice(1);
                this.buffer = this.buffer.concat(pausedSendTask.item);
                pausedSendTask.resume(true);
            }

            return Promise.resolve([item, true]);
        }

        if (this.sendQueue.length > 0) {
            const pausedSendTask = this.sendQueue[0];
            this.sendQueue = this.sendQueue.slice(1);
            pausedSendTask.resume(true);
            return Promise.resolve([pausedSendTask.item, true]);
        }

        return new Promise((resolve, reject) => {
            this.receiveQueue = this.receiveQueue.concat({
                resume: resolve
            });
        });
    }

    public close(): void {
        this._isClosed = true;
        this.buffer = [];

        for (const pausedSendTask of this.sendQueue) {
            pausedSendTask.resume(false);
        }

        for (const pausedReceiveTask of this.receiveQueue) {
            pausedReceiveTask.resume([undefined, false]);
        }

        this.sendQueue = [];
        this.receiveQueue = [];
    }

    public isClosed(): boolean {
        return this._isClosed;
    }

    public length(): number {
        return this.buffer.length + this.sendQueue.length;
    }

    [Symbol.asyncIterator](): AsyncIterator<Item> {
        return {
            next: async(): Promise<IteratorResult<Item>> => {
                const [value, succeed] = await this.receive();
                if (succeed) {
                    return {
                        value: value!,
                        done: false
                    }
                } else {
                    return {
                        value: value,
                        done: true
                    }
                }
            },
        };
    }
}