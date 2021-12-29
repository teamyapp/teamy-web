import { Task } from '@entity/task';
import { TeamStatus } from '@entity/teamStatus';
import { MutationEvent } from '@entity/events';
import { mutateState } from '@store/mutators';
import { LocalStore } from '@store/store';

export interface IAppState {
    currentUserId: number;
    needAttentionTask?: Task;
    teamStatus: TeamStatus;
}

const initialState = {
    currentUserId: -1,
    teamStatus: {
        upcomingTasks: [],
        inProgressTasks: [],
        deliveredTasks: [],
    },
};

export function createAppStore(): LocalStore<IAppState, MutationEvent> {
    return new LocalStore<IAppState, MutationEvent>(initialState, mutateState);
}
