import { AppState } from '@core/storage/states/app.state';
import { UserState } from '@core/storage/states/user.state';

import { Team } from './team';

export class User {
    constructor(private appState: AppState, private userState: UserState) {}

    public get id(): number {
        return this.userState.id;
    }

    public get firstName(): string {
        return this.userState.firstName;
    }

    public get lastName(): string {
        return this.userState.lastName;
    }

    public get profileUrl(): string | undefined {
        return this.userState.profileUrl;
    }

    public get createdAt(): Date {
        return this.userState.createdAt;
    }

    public get teams(): Team[] {
        return this.appState.teamMembers
            .filter((teamMember) => teamMember.userId === this.userState.id)
            .map(
                (teamMember) =>
                    new Team(
                        this.appState,
                        this.appState.teams[teamMember.teamId],
                    ),
            );
    }
}
