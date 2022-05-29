import { InvitationState } from '@core/statev2/invitation.state';
import { MessageState } from '@core/statev2/message.state';
import { TaskState } from '@core/statev2/task.state';
import { TeamState } from '@core/statev2/team.state';
import { ThreadState } from '@core/statev2/thread.state';
import { UserState } from '@core/statev2/user.state';

export interface AppState {
    currentUserId?: number;
    currentTeamId?: number;
    users: { [userId: number]: UserState };
    teams: { [teamId: number]: TeamState };
    tasks: { [taskId: number]: TaskState };
    invitations: { [invitationId: number]: InvitationState };
    threads: { [threadId: number]: ThreadState };
    messages: { [messageId: number]: MessageState };
    lastModifiedAt?: Date;
}
