import { AppState } from '@core/state/app.state';
import { InvitationState } from '@core/state/invitation.state';
import { InvitationStatus } from '@core/state/invitationStatus';

import { Team } from './team';
import { User } from './user';

export class Invitation {
    constructor(
        private appState: AppState,
        private invitationState: InvitationState,
    ) {}

    get id(): number {
        return this.invitationState.id;
    }

    get sender(): User {
        return new User(
            this.appState,
            this.appState.users[this.invitationState.senderUserId],
        );
    }

    get receiverFirstName(): string | undefined {
        return this.invitationState.receiverFirstName;
    }

    get receiverLastName(): string | undefined {
        return this.invitationState.receiverLastName;
    }

    get receiverEmail(): string | undefined {
        return this.invitationState.receiverEmail;
    }

    get receiver(): User | undefined {
        if (!this.invitationState.receiverUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.invitationState.receiverUserId],
        );
    }

    get joiningTeam(): Team {
        return new Team(
            this.appState,
            this.appState.teams[this.invitationState.joiningTeamId],
        );
    }

    get expireAt(): Date {
        return this.invitationState.expireAt;
    }

    get createdAt(): Date {
        return this.invitationState.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.invitationState.updatedAt;
    }

    get status(): InvitationStatus {
        return this.invitationState.status;
    }

    get code(): string {
        return this.invitationState.code;
    }
}
