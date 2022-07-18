import { Invitation } from '@core/entity/invitation';
import { InvitationStatus } from '@core/entity/invitationStatus';

const invitationStatusOrder: Record<InvitationStatus, number> = {
    ACCEPTED: 0,
    DECLINED: 1,
    EXPIRED: 2,
    PENDING: 3,
    REVOKED: 4,
};

export function orderByStatus(invitations: Invitation[]): Invitation[] {
    return invitations.sort((invitation1, invitation2) => {
        return (
            invitationStatusOrder[invitation1.status] -
            invitationStatusOrder[invitation2.status]
        );
    });
}
