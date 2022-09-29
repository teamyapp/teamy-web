import { Team } from '@core/entity/team';
import { SprintNode } from '@core/storage/graph/sprint.node';
import { TeamMemberNode } from '@core/storage/graph/teamMember.node';
import { TeamState } from '@core/storage/states/team.state';
import { LocalStore } from '@core/storage/syncer/localStore';

import { InvitationNode } from './invitation.node';
import { TaskNode } from './task.node';
import { UserNode } from './user.node';

export class TeamNode implements Team {
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

    public get creator(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.teamState.creatorUserId],
        );
    }

    public get owner(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.teamState.ownerUserId],
        );
    }

    public get members(): TeamMemberNode[] {
        const appState = this.localStore.getState();
        return appState.teamMembers
            .filter((teamMember) => teamMember.teamId === this.teamState.id)
            .map(
                (teamMember) => new TeamMemberNode(this.localStore, teamMember),
            );
    }

    public get tasks(): TaskNode[] {
        const appState = this.localStore.getState();
        const tasks: TaskNode[] = [];
        for (let taskId in appState.tasks) {
            const taskState = appState.tasks[taskId];
            if (taskState.owningTeamId === this.teamState.id) {
                tasks.push(new TaskNode(this.localStore, taskState));
            }
        }

        return tasks;
    }

    public get invitations(): InvitationNode[] {
        const appState = this.localStore.getState();
        const invitations: InvitationNode[] = [];
        for (let invitationId in appState.invitations) {
            const invitationState = appState.invitations[invitationId];
            if (invitationState.teamId === this.teamState.id) {
                invitations.push(
                    new InvitationNode(this.localStore, invitationState),
                );
            }
        }

        return invitations;
    }

    public get sprints(): SprintNode[] {
        const appState = this.localStore.getState();
        const sprints: SprintNode[] = [];
        for (let sprintId in appState.sprints) {
            const sprintState = appState.sprints[sprintId];
            if (sprintState.owningTeamId === this.teamState.id) {
                sprints.push(new SprintNode(this.localStore, sprintState));
            }
        }

        return sprints;
    }
}
