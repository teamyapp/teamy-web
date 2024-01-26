import { MaxViewersActivator, PercentageActivator, TimeRangeActivator } from "@core/entity/rollout";
import { LocalStore } from "../syncer/localStore";
import { ActivatorState, MaxViewersActivatorState, PercentageActivatorState, TimeRangeActivatorState } from "../states/activator.state";



export class StaticActivatorNode implements ActivatorState {
    constructor(
        private localStore: LocalStore,
        private activator: ActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): 'STATIC' {
        return 'STATIC'
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}

export class TimeRangeActivatorNode implements TimeRangeActivator {
    constructor(
        private localStore: LocalStore,
        private activator: ActivatorState,
        private timeRangeActivator: TimeRangeActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): 'TIME_RANGE' {
        return 'TIME_RANGE';
    }

    get startAt(): Date | undefined {
        return this.timeRangeActivator.startAt;
    }

    get endAt(): Date | undefined {
        return this.timeRangeActivator.endAt;
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}

export class MaxViewersActivatorNode implements MaxViewersActivator {
    constructor(
        private localStore: LocalStore,
        private activator: ActivatorState,
        private maxViewersActivator: MaxViewersActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): 'MAX_VIEWERS' {
        return 'MAX_VIEWERS'
    }

    get maxViewers(): number {
        return this.maxViewersActivator.maxViewers;
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}

export class PercentageActivatorNode implements PercentageActivator {
    constructor(
        private localStore: LocalStore,
        private activator: ActivatorState,
        private percentageActivator: PercentageActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): 'PERCENTAGE' {
        return 'PERCENTAGE'
    }

    get percentage(): number {
        return this.percentageActivator.percentage;
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}