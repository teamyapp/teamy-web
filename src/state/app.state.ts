import { InvitationState } from '@core/state/invitation.state';
import { MessageState } from '@core/state/message.state';
import { TaskState } from '@core/state/task.state';
import { TeamState } from '@core/state/team.state';
import { ThreadState } from '@core/state/thread.state';
import { UserState } from '@core/state/user.state';

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
