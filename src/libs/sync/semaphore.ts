export type AwakeCallback = () => void;

export class Semaphore {
    private pendingThreadAwakeCallbacks: AwakeCallback[] = [];
    private availableThreads: number;

    constructor(
        private id: string,
        private initialAvailableThreads: number = 0,
        private maxAvailableThreads: number = 1,
    ) {
        this.availableThreads = initialAvailableThreads;
    }

    public wait(): Promise<void> {
        if (this.availableThreads > 0) {
            this.availableThreads--;
            return Promise.resolve();
        }

        return new Promise((resolve: AwakeCallback, reject) => {
            this.pendingThreadAwakeCallbacks.push(resolve);
        });
    }

    public release(): number {
        const prevAvailableThreads = this.availableThreads;
        if (this.pendingThreadAwakeCallbacks.length > 0) {
            const task = this.pendingThreadAwakeCallbacks[0];
            this.pendingThreadAwakeCallbacks =
                this.pendingThreadAwakeCallbacks.slice(1);
            task();
        } else if (this.availableThreads < this.maxAvailableThreads) {
            this.availableThreads++;
        }

        return prevAvailableThreads;
    }
}
