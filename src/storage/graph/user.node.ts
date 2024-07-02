import { User } from '@core/entity/user';
import { LinkedUserNode } from '@core/storage/graph/linkedUser.node';
import { TeamNode } from '@core/storage/graph/team.node';
import { UserState } from '@core/storage/states/user.state';
import { LocalStore } from '@core/storage/syncer/localStore';

export class UserNode implements User {
    constructor(
        private localStore: LocalStore,
        private userState: UserState,
    ) {}

    public get id(): number {
        return this.userState.id;
    }

    public get firstName(): string {
        return this.userState.firstName;
    }

    public get lastName(): string {
        return this.userState.lastName;
    }

    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public get profileUrl(): string | undefined {
        return this.userState.profileUrl;
    }

    public get createdAt(): Date {
        return this.userState.createdAt;
    }

    public get teams(): TeamNode[] {
        const appState = this.localStore.getState();
        return appState.teamMembers
            .filter(
                (teamMember) =>
                    teamMember.userId === this.userState.id &&
                    appState.teams[teamMember.teamId],
            )
            .map(
                (teamMember) =>
                    new TeamNode(
                        this.localStore,
                        appState.teams[teamMember.teamId],
                    ),
            );
    }

    public get linkedUsers(): LinkedUserNode[] {
        return this.localStore
            .getState()
            .userLinks.filter(
                (userLink) => userLink.internalUserId === this.userState.id,
            )
            .map((userLink) => new LinkedUserNode(userLink));
    }
}
