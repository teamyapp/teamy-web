import { Invitation } from '@core/entity/invitation';
import { InvitationState } from '@core/storage/states/invitation.state';
import { InvitationStatus } from '@core/storage/states/invitationStatus';
import { LocalStore } from '@core/storage/syncer/localStore';

import { TeamNode } from './team.node';
import { UserNode } from './user.node';

export class InvitationNode implements Invitation {
    constructor(
        private localStore: LocalStore,
        private invitationState: InvitationState,
    ) {}

    public get id(): number {
        return this.invitationState.id;
    }

    public get sender(): UserNode {
        return new UserNode(
            this.localStore,
            this.localStore.getState().users[this.invitationState.senderUserId],
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

    public get receiver(): UserNode | undefined {
        if (!this.invitationState.receiverUserId) {
            return undefined;
        }

        return new UserNode(
            this.localStore,
            this.localStore.getState().users[
                this.invitationState.receiverUserId
            ],
        );
    }

    public get joiningTeam(): TeamNode {
        return new TeamNode(
            this.localStore,
            this.localStore.getState().teams[this.invitationState.teamId],
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
