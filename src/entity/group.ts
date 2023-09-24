import { Rollout } from '@core/entity/rollout';

export type Group<GroupMember> =
    | StaticGroup<GroupMember>
    | FilterGroup<GroupMember>;

export interface StaticGroup<GroupMember> {
    id: number;
    type: 'static';
    name: string;
    members: GroupMember[];
    createdAt: Date;
    rollouts: Rollout<GroupMember>[];
}

export interface FilterGroup<GroupMember> {
    id: number;
    type: 'filter';
    name: string;
    filter: string;
    createdAt: Date;
    rollouts: Rollout<GroupMember>[];
}
