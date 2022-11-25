import { Duration } from '@lib/entity/duration';
import { RandomNumberGenerator } from '@lib/math/randomNumberGenerator';

import { BackOff } from './backoff';

interface ExponentialOptions {
    minDelay: number;
    maxDelay: number;
    scalingFactor: number;
    randomOffset: number;
    randomOffsetUnit: number;
    resetOnSuccess: boolean;
}

export class ExponentialBackoff implements BackOff {
    private minDelay = 200;
    private maxDelay = 5 * 60 * 200;
    private nextDelay = 200;
    private scalingFactor = 2;
    private randomOffset = 100;
    private randomOffsetUnit = 1;
    private resetOnSuccess = false;

    constructor(
        private randGen: RandomNumberGenerator,
        options: Partial<ExponentialOptions> = {},
    ) {
        const {
            minDelay,
            maxDelay,
            scalingFactor,
            randomOffset,
            randomOffsetUnit,
            resetOnSuccess,
        } = options;
        this.minDelay = minDelay ?? this.minDelay;
        this.maxDelay = maxDelay ?? this.maxDelay;
        this.scalingFactor = scalingFactor ?? this.scalingFactor;
        this.randomOffset = randomOffset ?? this.randomOffset;
        this.randomOffsetUnit = randomOffsetUnit ?? this.randomOffsetUnit;
        this.resetOnSuccess = resetOnSuccess ?? this.resetOnSuccess;

        this.nextDelay = minDelay ?? this.nextDelay;
    }

    public onSuccess() {
        if (this.resetOnSuccess) {
            this.nextDelay = this.minDelay;
            return;
        }

        const scaled = this.nextDelay / this.scalingFactor;
        this.nextDelay = Math.max(scaled, this.minDelay) + this.randOffset();
    }

    public onFailure() {
        const scaled = this.nextDelay * this.scalingFactor;
        this.nextDelay = Math.min(scaled, this.maxDelay) + this.randOffset();
    }

    public delay() {
        return new Duration(this.nextDelay);
    }

    private randOffset() {
        return (
            Math.floor(this.randGen.randomFloat() * this.randomOffset) *
            this.randomOffsetUnit
        );
    }
}
