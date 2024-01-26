export type Activator =
    | StaticActivator
    | TimeRangeActivator
    | MaxViewersActivator
    | PercentageActivator;

export interface StaticActivator {
    id: number;
    type: 'STATIC';
    createdAt: Date;
    updatedAt?: Date;
}
export interface TimeRangeActivator {
    id: number;
    type: 'TIME_RANGE';
    startAt?: Date;
    endAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

export interface MaxViewersActivator {
    id: number;
    type: 'MAX_VIEWERS';
    maxViewers: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface PercentageActivator {
    id: number;
    type: 'PERCENTAGE';
    percentage: number;
    createdAt: Date;
    updatedAt?: Date;
}

export type VersionSelector = StaticVersionSelector | ExperimentVersionSelector;

export interface StaticVersionSelector {
    id: number;
    type: 'STATIC';
    versionNumber: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ExperimentVersionSelector {
    id: number;
    type: 'EXPERIMENT';
    versionNumbers: number[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface Rollout {
    id: number;
    activator: Activator;
    versionSelector: VersionSelector;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
