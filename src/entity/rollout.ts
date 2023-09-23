import { Group } from '@core/entity/group';

export type Activator =
    | StaticActivator
    | TimeRangeActivator
    | MaxViewersActivator
    | PercentageActivator;

export interface StaticActivator {
    id: number;
    type: 'static';
    createdAt: Date;
    updatedAt?: Date;
}

export interface TimeRangeActivator {
    id: number;
    type: 'timeRange';
    startAt?: Date;
    endAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

export interface MaxViewersActivator {
    id: number;
    type: 'maxViewers';
    maxViewers: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface PercentageActivator {
    id: number;
    type: 'percentage';
    percentage: number;
    createdAt: Date;
    updatedAt?: Date;
}

export type VersionSelector = StaticVersionSelector | ExperimentVersionSelector;

export interface StaticVersionSelector {
    id: number;
    type: 'static';
    versionNumber: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ExperimentVersionSelector {
    id: number;
    type: 'experiment';
    versionNumbers: number[];
    createdAt: Date;
    updatedAt?: Date;
}

export interface Rollout<GroupMember> {
    id: number;
    name: string;
    activator: Activator;
    versionSelector: VersionSelector;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt?: Date;
    groups: Group<GroupMember>[];
}
