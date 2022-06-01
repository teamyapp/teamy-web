import { AppState } from '@core/statev2/app.state';
import { TeamState } from '@core/statev2/team.state';

import { Invitation } from './invitation';
import { Task } from './task';
import { User } from './user';

export class Team {
    constructor(private appState: AppState, private teamState: TeamState) {}

    get id(): number {
        return this.teamState.id;
    }

    get name(): string {
        return this.teamState.name;
    }

    get iconUrl(): string | undefined {
        return this.teamState.iconUrl;
    }

    get createdAt(): Date {
        return this.teamState.createdAt;
    }

    get creator(): User {
        return new User(
            this.appState,
            this.appState.users[this.teamState.creatorUserId],
        );
    }

    get owner(): User {
        return new User(
            this.appState,
            this.appState.users[this.teamState.ownerUserId],
        );
    }

    get members(): User[] {
        return this.teamState.memberUserIds?.map(
            (userId: number) =>
                new User(this.appState, this.appState.users[userId]),
        );
    }

    get tasks(): Task[] {
        return this.teamState.taskIds?.map(
            (taskId: number) =>
                new Task(this.appState, this.appState.tasks[taskId]),
        );
    }

    get invitations(): Invitation[] {
        return this.teamState.invitationIds?.map(
            (invitationId: number) =>
                new Invitation(
                    this.appState,
                    this.appState.invitations[invitationId],
                ),
        );
    }
}
