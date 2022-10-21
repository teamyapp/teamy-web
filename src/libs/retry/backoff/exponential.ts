import { BackOff } from '.';

export class ExponentialBackoff implements Backoff {
    constructor(
        private minDelay: number,
        private maxDelay: number,
        private scalingFactor: number,
        private randomOffset: number,
        private randomOffsetUnit: number,
        private nextDelay: number,
        private resetOnSuccess: boolean,
    ) {}

    public onSuccess() {
        if (this.resetOnSuccess) {
            this.nextDelay = this.minDelay;
            return;
        }

        const scaled = Math.pow(this.nextDelay, -this.scalingFactor);
        this.nextDelay = Math.max(scaled, this.minDelay) + this.randOffset();
    }

    public onFailure() {
        const scaled = Math.pow(this.nextDelay, this.scalingFactor);
        this.nextDelay = Math.min(scaled, this.maxDelay) + this.randOffset();
    }

    public delay() {
        return this.nextDelay;
    }

    private randOffset() {
        return (
            Math.floor(Math.random() * this.randomOffset) *
            this.randomOffsetUnit
        );
    }
}

export class ExponentialBuilder {
    constructor(
        private option: {
            minDelay?: number;
            maxDelay?: number;
            scalingFactor?: number;
            randomOffset?: number;
            randomOffsetUnit?: number;
            resetOnSuccess?: boolean;
        } = {},
    ) {}

    public build() {
        const {
            minDelay = 200,
            maxDelay = 5 * 60 * 200,
            scalingFactor = 2,
            randomOffset = 100,
            randomOffsetUnit = 1,
            resetOnSuccess = false,
        } = this.option;

        return new Exponential(
            minDelay,
            maxDelay,
            scalingFactor,
            randomOffset,
            randomOffsetUnit,
            minDelay,
            resetOnSuccess,
        );
    }
}
