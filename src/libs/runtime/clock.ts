export interface Clock {
    now(): Date;
}

export class BuiltInClock implements Clock {
    now(): Date {
        return new Date();
    }
}

export class TestClock implements Clock {
    private currentTime: Date = new Date();

    setCurrentTime(currentTime: Date) {
        this.currentTime = currentTime;
    }

    now(): Date {
        return this.currentTime;
    }
}
