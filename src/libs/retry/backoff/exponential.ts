import { Duration } from '../duration';
import { BackOff } from './backoff';


interface ExponentialOptions {
    minDelay: number;
    maxDelay: number;
    nextDelay: number;
    scalingFactor: number;
    randomOffset: number;
    randomOffsetUnit: number;
    resetOnSuccess: boolean;
}

export class Exponential implements BackOff {
    private options: ExponentialOptions

    constructor(
        options: Partial<ExponentialOptions> = {}
    ) {
        this.options = {
            minDelay: 200,
            maxDelay: 5 * 60 * 200,
            nextDelay: 200,
            scalingFactor: 2,
            randomOffset: 100,
            randomOffsetUnit: 1,
            resetOnSuccess: false,
            ...options
        }

        this.options.nextDelay = this.options.minDelay
    }

    public onSuccess() {
        if (this.options.resetOnSuccess) {
            this.options.nextDelay = this.options.minDelay;
            return;
        }

        const scaled = Math.pow(this.options.nextDelay, -this.options.scalingFactor);
        this.options.nextDelay = Math.max(scaled, this.options.minDelay) + this.randOffset();
    }

    public onFailure() {
        const scaled = Math.pow(this.options.nextDelay, this.options.scalingFactor);
        this.options.nextDelay = Math.min(scaled, this.options.maxDelay) + this.randOffset();
    }

    public delay() {
        return new Duration(this.options.nextDelay)
    }

    private randOffset() {
        return (
            Math.floor(Math.random() * this.options.randomOffset) *
            this.options.randomOffsetUnit
        );
    }
}
