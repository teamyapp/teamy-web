export interface Clock {
    now(): Date
    wait(timeout: number): Promise<void>
}


export class BrowserClock implements Clock {
    now(): Date {
        return new Date()
    }

    async wait(timeout: number) {
        await new Promise((resolve) => setTimeout(() => resolve(null), timeout))
    }
}

export class MockClock implements Clock {
    private currentTime: Date = new Date()

    setCurrentTime(currentTime: Date) {
        this.currentTime = currentTime
    }

    now(): Date {
        return this.currentTime
    }

    async wait(timeout: number) {}
}