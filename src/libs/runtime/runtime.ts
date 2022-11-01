import { Duration } from '@lib/entity/duration';
import { Semaphore } from '@lib/sync/semaphore';

export interface Runtime {
    threadSleep(duration: Duration): Promise<void>;
}

export class BuiltInRuntime implements Runtime {
    async threadSleep(duration: Duration): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(() => resolve(null), duration.totalMilliSeconds),
        );
    }
}

export class TestRuntime implements Runtime {
    private readonly semaphore = new Semaphore('TestRunTime');
    public beforeThreadSleep?: (duration: Duration) => Promise<void>;

    async threadSleep(duration: Duration): Promise<void> {
        if (this.beforeThreadSleep) {
            await this.beforeThreadSleep(duration);
        }

        return await this.semaphore.wait();
    }

    threadAwake() {
        this.semaphore.release();
    }
}
