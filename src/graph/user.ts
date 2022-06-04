import { AppState } from '@core/state/app.state';
import { UserState } from '@core/state/user.state';

import { Team } from './team';

export class User {
    constructor(private appState: AppState, private userState: UserState) {}

    get id(): number {
        return this.userState.id;
    }

    get firstName(): string {
        return this.userState.firstName;
    }

    get lastName(): string {
        return this.userState.lastName;
    }

    get profileUrl(): string | undefined {
        return this.userState.profileUrl;
    }

    get createdAt(): Date {
        return this.userState.createdAt;
    }

    get teams(): Team[] {
        return (
            this.userState.teamIds?.map(
                (teamId: number) =>
                    new Team(this.appState, this.appState.teams[teamId]),
            ) || []
        );
    }
}
