import { App } from './app';
import { Rollout } from './rollout';
import { Team } from './team';
import { User } from './user';

export type Group = StaticGroup<User> | StaticGroup<Team> | FilterGroup;

export type GroupType = 'STATIC' | 'FILTER'
export type GroupMemberType = 'USER' | 'TEAM'

export interface GroupInfo {
    id: number;
    type: GroupType;
    memberType: GroupMemberType;
    name: string;
    createdAt: Date;
    updatedAt?: Date;
    rollouts: Rollout[];
    apps: App[];
}

export interface StaticGroup<Member> extends GroupInfo {
    type: 'STATIC';
    members: Member[];
}

export interface FilterGroup extends GroupInfo {
    type: 'FILTER';
    filter: string;
}
