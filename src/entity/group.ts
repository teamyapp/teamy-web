import { App } from "./app";
import { Rollout } from "./rollout";
import { Team } from "./team";
import { User } from "./user";


export type Group = StaticGroup<User> | StaticGroup<Team> | FilterGroup;

export type GroupType = 'STATIC' | 'FILTER'


interface GroupInfo {
    id: number;
    type: GroupType;
    name: string;
    createdAt: Date;
    updatedAt?: Date;
    rollouts: Rollout[];
    app: App;
}

export interface StaticGroup<Member> extends GroupInfo {
    type: 'STATIC';
    members: Member[];
}


export interface FilterGroup extends GroupInfo {
    type: 'FILTER';
    filter: string;
    memberCount: number;
}