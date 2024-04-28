import { TeamNode } from '@core/storage/graph/team.node';
import { UserNode } from '@core/storage/graph/user.node';
import { LocalStore } from '@core/storage/syncer/localStore';
import { TeamMemberGroupState } from '../states/teamMemberGroup.state';
import { TeamMemberGroup } from '@core/entity/teamMemberGroup';

export class TeamMemberGroupNode implements TeamMemberGroup {
    constructor(
        private localStore: LocalStore,
        private teamMemberGroupState: TeamMemberGroupState,
    ) {}

    public get id(): number {
        return this.teamMemberGroupState.id;
    }

    public get name(): string {
        return this.teamMemberGroupState.name;
    }

    public get createdAt(): Date {
        return this.teamMemberGroupState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.teamMemberGroupState.updatedAt;
    }

    get team(): TeamNode {
        const appState = this.localStore.getState();
        const teamState = appState.teams[this.teamMemberGroupState.teamId];
        return new TeamNode(this.localStore, teamState);
    }

    get members(): UserNode[] {
        const appState = this.localStore.getState();

        return appState.teamMemberGroupUserRelations
            .filter(
                (relation) => relation.groupId === this.teamMemberGroupState.id,
            )
            .map(
                (relation) =>
                    new UserNode(
                        this.localStore,
                        appState.users[relation.memberUserId],
                    ),
            );
    }
}
