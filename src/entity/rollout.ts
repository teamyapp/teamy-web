export type Activator =
    | StaticActivator
    | TimeRangeActivator
    | MaxViewersActivator
    | PercentageActivator;


export type ActivatorType = 'STATIC' | 'TIME_RANGE' | 'MAX_VIEWERS' | 'PERCENTAGE';

export interface ActivatorInfo {
    id: number;
    type: ActivatorType;
    createdAt: Date;
    updatedAt?: Date;
}

export interface StaticActivator extends ActivatorInfo {
    type: 'STATIC';
}

export interface TimeRangeActivator extends ActivatorInfo{
    type: 'TIME_RANGE';
    startAt?: Date;
    endAt?: Date;
}

export interface MaxViewersActivator extends ActivatorInfo{
    type: 'MAX_VIEWERS';
    maxViewers: number;
}

export interface PercentageActivator extends ActivatorInfo{
    type: 'PERCENTAGE';
    percentage: number;
}

export type VersionSelector = StaticVersionSelector | ExperimentVersionSelector;

export type VersionSelectorType = 'STATIC' | 'EXPERIMENT';

export interface VersionSelectorInfo {
    id: number;
    type: VersionSelectorType;
    updatedAt?: Date;
}

export interface StaticVersionSelector extends VersionSelectorInfo {
    type: 'STATIC';
    versionNumber: number;
}

export interface ExperimentVersionSelector extends VersionSelectorInfo {
    type: 'EXPERIMENT';
    versionNumbers: number[];
}

export interface Rollout {
    id: number;
    activator: Activator;
    versionSelector: VersionSelector;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
