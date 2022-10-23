import { Duration } from './duration';
export interface Clock {
    now(): Date;
    wait(duration: Duration): Promise<void>;
}

export class BrowserClock implements Clock {
    now(): Date {
        return new Date();
    }

    async wait(duration: Duration) {
        await new Promise((resolve) =>
            setTimeout(() => resolve(null), duration.totalMilliSeconds),
        );
    }
}

export class MockClock implements Clock {
    private currentTime: Date = new Date();

    setCurrentTime(currentTime: Date) {
        this.currentTime = currentTime;
    }

    now(): Date {
        return this.currentTime;
    }

    async wait(duration: Duration) {}
}
