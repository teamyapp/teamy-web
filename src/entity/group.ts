import { App } from "./app";
import { Rollout } from "./rollout";
import { Team } from "./team";
import { User } from "./user";


export type Group = StaticGroup<User> | StaticGroup<Team> | FilterGroup;

export type GroupType = 'STATIC' | 'FILTER'

export interface StaticGroup<Member> {
    id: number;
    type: 'STATIC';
    name: string;
    members: Member[];
    createdAt: Date;
    updatedAt?: Date;
    rollouts: Rollout[];
    app: App;
}


export interface FilterGroup {
    id: number;
    type: 'FILTER';
    name: string;
    filter: string;
    memberCount: number;
    createdAt: Date;
    updatedAt?: Date;
    rollouts: Rollout[];
    app: App;
}