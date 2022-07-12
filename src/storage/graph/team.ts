import { TeamState } from '@core/storage/states/team.state';
import { LocalStore } from '@core/storage/syncer/localStore';

import { Invitation } from './invitation';
import { Task } from './task';
import { User } from './user';

export class Team {
    constructor(private localStore: LocalStore, private teamState: TeamState) {}

    public get id(): number {
        return this.teamState.id;
    }

    public get name(): string {
        return this.teamState.name;
    }

    public get iconUrl(): string | undefined {
        return this.teamState.iconUrl;
    }

    public get createdAt(): Date {
        return this.teamState.createdAt;
    }

    public get creator(): User {
        return new User(
            this.localStore,
            this.localStore.getState().users[this.teamState.creatorUserId],
        );
    }

    public get owner(): User {
        return new User(
            this.localStore,
            this.localStore.getState().users[this.teamState.ownerUserId],
        );
    }

    public get members(): User[] {
        const appState = this.localStore.getState();
        return appState.teamMembers
            .filter((teamMember) => teamMember.teamId === this.teamState.id)
            .map(
                (teamMember) =>
                    new User(
                        this.localStore,
                        appState.users[teamMember.userId],
                    ),
            );
    }

    public get tasks(): Task[] {
        const appState = this.localStore.getState();
        const tasks: Task[] = [];
        for (let taskId in appState.tasks) {
            const taskState = appState.tasks[taskId];
            if (taskState.owningTeamId === this.teamState.id) {
                tasks.push(new Task(this.localStore, taskState));
            }
        }

        return tasks;
    }

    public get invitations(): Invitation[] {
        const appState = this.localStore.getState();
        const invitations: Invitation[] = [];
        for (let invitationId in appState.invitations) {
            const invitationState = appState.invitations[invitationId];
            if (invitationState.teamId === this.teamState.id) {
                invitations.push(
                    new Invitation(this.localStore, invitationState),
                );
            }
        }

        return invitations;
    }
}
