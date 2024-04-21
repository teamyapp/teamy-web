import {
    ActivatorInfo,
    ActivatorType,
    MaxViewersActivator,
    PercentageActivator,
    StaticActivator,
    TimeRangeActivator,
} from '@core/entity/rollout';

import {
    ActivatorState,
    MaxViewersActivatorState,
    PercentageActivatorState,
    TimeRangeActivatorState,
} from '../states/activator.state';
import { LocalStore } from '../syncer/localStore';

export type ActivatorNode =
    | StaticActivatorNode
    | TimeRangeActivatorNode
    | MaxViewersActivatorNode
    | PercentageActivatorNode;

export class ActivatorInfoNode implements ActivatorInfo {
    constructor(
        protected localStore: LocalStore,
        protected activator: ActivatorState,
    ) {}

    get id(): number {
        return this.activator.id;
    }

    get type(): ActivatorType {
        return this.activator.type;
    }

    get createdAt(): Date {
        return this.activator.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.activator.updatedAt;
    }
}

export class StaticActivatorNode
    extends ActivatorInfoNode
    implements StaticActivator
{
    get type(): 'STATIC' {
        return 'STATIC';
    }
}

export class TimeRangeActivatorNode
    extends ActivatorInfoNode
    implements TimeRangeActivator
{
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

export class MaxViewersActivatorNode
    extends ActivatorInfoNode
    implements MaxViewersActivator
{
    constructor(
        protected localStore: LocalStore,
        protected activator: ActivatorState,
        private maxViewersActivator: MaxViewersActivatorState,
    ) {
        super(localStore, activator);
    }

    get type(): 'MAX_VIEWERS' {
        return 'MAX_VIEWERS';
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
        return 'PERCENTAGE';
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
