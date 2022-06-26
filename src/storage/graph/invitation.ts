import { AppState } from '@core/storage/states/app.state';
import { InvitationState } from '@core/storage/states/invitation.state';
import { InvitationStatus } from '@core/storage/states/invitationStatus';

import { Team } from './team';
import { User } from './user';

export class Invitation {
    constructor(
        private appState: AppState,
        private invitationState: InvitationState,
    ) {}

    public get id(): number {
        return this.invitationState.id;
    }

    public get sender(): User {
        return new User(
            this.appState,
            this.appState.users[this.invitationState.senderUserId],
        );
    }

    public get receiverFirstName(): string | undefined {
        return this.invitationState.receiverFirstName;
    }

    public get receiverLastName(): string | undefined {
        return this.invitationState.receiverLastName;
    }

    public get receiverEmail(): string | undefined {
        return this.invitationState.receiverEmail;
    }

    public get receiver(): User | undefined {
        if (!this.invitationState.receiverUserId) {
            return undefined;
        }

        return new User(
            this.appState,
            this.appState.users[this.invitationState.receiverUserId],
        );
    }

    public get joiningTeam(): Team {
        return new Team(
            this.appState,
            this.appState.teams[this.invitationState.teamId],
        );
    }

    public get expireAt(): Date {
        return this.invitationState.expireAt;
    }

    public get createdAt(): Date {
        return this.invitationState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.invitationState.updatedAt;
    }

    public get status(): InvitationStatus {
        return this.invitationState.status;
    }

    public get code(): string {
        return this.invitationState.code;
    }
}
