import { MaxViewersActivator, PercentageActivator, TimeRangeActivator, StaticActivator, ActivatorInfo } from "@core/entity/rollout";
import { LocalStore } from "../syncer/localStore";
import { ActivatorState, MaxViewersActivatorState, PercentageActivatorState, TimeRangeActivatorState } from "../states/activator.state";


export class ActivatorNode implements ActivatorInfo {
    constructor(
        protected localStore: LocalStore,
        protected activator: ActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): 'STATIC' | 'TIME_RANGE' | 'MAX_VIEWERS' | 'PERCENTAGE' {
        return this.activator.type;
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}



export class StaticActivatorNode extends ActivatorNode implements StaticActivator {
    get type(): 'STATIC' {
        return 'STATIC'
    }
}

export class TimeRangeActivatorNode extends ActivatorNode implements TimeRangeActivator {
    constructor(
        protected localStore: LocalStore,
        protected activator: ActivatorState,
        private timeRangeActivator: TimeRangeActivatorState,
    ) {
        super(localStore, activator);
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
}

export class MaxViewersActivatorNode extends ActivatorNode implements MaxViewersActivator {
    constructor(
        protected localStore: LocalStore,
        protected activator: ActivatorState,
        private maxViewersActivator: MaxViewersActivatorState,
    ) {
        super(localStore, activator);
    }

    get type(): 'MAX_VIEWERS' {
        return 'MAX_VIEWERS'
    }

    get maxViewers(): number {
        return this.maxViewersActivator.maxViewers;
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