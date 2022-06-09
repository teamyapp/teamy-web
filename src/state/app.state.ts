import {
    InvitationState,
    parseInvitationState,
} from '@core/state/invitation.state';
import { MessageState, parseMessageState } from '@core/state/message.state';
import { TaskState, parseTaskState } from '@core/state/task.state';
import { TeamState, parseTeamState } from '@core/state/team.state';
import { ThreadState, parseThreadState } from '@core/state/thread.state';
import { UserState, parseUserState } from '@core/state/user.state';

export interface AppState {
    currentUserId?: number;
    currentTeamId?: number;
    users: { [userId: number]: UserState };
    teams: { [teamId: number]: TeamState };
    tasks: { [taskId: number]: TaskState };
    invitations: { [invitationId: number]: InvitationState };
    threads: { [threadId: number]: ThreadState };
    messages: { [messageId: number]: MessageState };
}

export function parseAppState(jsonStateStr: string | null): AppState {
    if (!jsonStateStr) {
        return {
            users: {},
            teams: {},
            tasks: {},
            invitations: {},
            threads: {},
            messages: {},
        };
    }

    const jsonState = JSON.parse(jsonStateStr);
    const appState: AppState = {
        users: {},
        teams: {},
        tasks: {},
        invitations: {},
        threads: {},
        messages: {},
    };
    appState.currentUserId = jsonState.currentUserId;
    appState.currentTeamId = jsonState.currentTeamId;
    for (const id in jsonState.users || {}) {
        const userState = parseUserState(jsonState.users[id]);
        appState.users[userState.id] = userState;
    }

    for (const id in jsonState.teams || {}) {
        const teamState = parseTeamState(jsonState.teams[id]);
        appState.teams[teamState.id] = teamState;
    }

    for (const id in jsonState.tasks || {}) {
        const taskState = parseTaskState(jsonState.tasks[id]);
        appState.tasks[taskState.id] = taskState;
    }

    for (const id in jsonState.invitations || {}) {
        const invitationState = parseInvitationState(jsonState.invitations[id]);
        appState.invitations[invitationState.id] = invitationState;
    }

    for (const id in jsonState.threads || {}) {
        const threadState = parseThreadState(jsonState.threads[id]);
        appState.threads[threadState.id] = threadState;
    }

    for (const id in jsonState.messages || {}) {
        const messageState = parseMessageState(jsonState.messages[id]);
        appState.messages[messageState.id] = messageState;
    }

    return appState;
}
