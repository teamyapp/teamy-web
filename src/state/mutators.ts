import { MutateState } from '@lib/store/localStore';

import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';
import { TaskStatus } from '@core/entity/taskStatus';
import * as events from '@core/event/mutation';

import { IAppState } from './state';

function createTaskMutateState(
    state: IAppState,
    event: events.CreateTask,
): IAppState {
    let task: Task = Object.assign({}, event.task, {
        // temporary id until the server creates an id for it
        // todo: in the future, need a distributed id solution
        // uuid+user-id is a good solution
        id: '-1',
        availableActions: getActions('UPCOMING'),
        status: 'UPCOMING',
    });
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: state.teamTasks.concat(task),
    });
}

function updateTaskMutateState(
    state: IAppState,
    event: events.UpdateTask,
): IAppState {
    const tasks = state.teamTasks.map((oldTask: Task) =>
        replaceTask(event.task, oldTask, event.task.status!),
    );
    let needAttentionTask = state.needAttentionTask;
    if (needAttentionTask) {
        needAttentionTask = replaceTask(
            event.task,
            needAttentionTask,
            'NEED_ATTENTION',
        );
    }
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: tasks,
        needAttentionTask: needAttentionTask,
    });
}

function deleteTaskMutateState(
    state: IAppState,
    event: events.DeleteTask,
): IAppState {
    const tasks = state.teamTasks.filter(
        (task: Task) => task.id !== event.taskId,
    );
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: tasks,
        needAttentionTask:
            state.needAttentionTask?.id === event.taskId
                ? undefined
                : state.needAttentionTask,
    });
}

function startTaskMutateState(
    state: IAppState,
    event: events.StartTask,
): IAppState {
    const tasks = state.teamTasks.map((oldTask: Task) =>
        updateTask(event.taskId, oldTask, 'IN_PROGRESS'),
    );
    const needAttentionTask = state.teamTasks.filter(
        (task: Task) => task.id === event.taskId,
    )[0];
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: tasks,
        needAttentionTask,
    });
}

function completeTaskMutateState(
    state: IAppState,
    event: events.CompleteTask,
): IAppState {
    const tasks = state.teamTasks.map((oldTask: Task) =>
        updateTask(event.taskId, oldTask, 'DELIVERED'),
    );
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: tasks,
        needAttentionTask: undefined,
    });
}

function removeTaskOwnerMutateState(
    state: IAppState,
    event: events.RemoveTaskOwner,
): IAppState {
    const task = state.teamTasks.filter(
        (task: Task) => task.id === event.taskId,
    )[0];
    if (task) {
        const newTask = Object.assign({}, task, {
            owner: undefined,
        });
        return updateTaskMutateState(state, {
            type: 'UpdateTask',
            task: newTask,
        });
    }
    return state;
}

function updateActiveTeamMutateState(
    state: IAppState,
    event: events.UpdateActiveTeam,
) {
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        activeTeamId: event.teamId,
    });
}

function createTeamMutateState(state: IAppState, event: events.CreateTeam) {
    const newTeam = {
        id: '-1',
        name: event.team.name,
    };
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teams: state.teams.concat([newTeam]),
    });
}

export const mutateState: MutateState<IAppState, events.MutationEvent> = (
    state: IAppState,
    event: events.MutationEvent,
): IAppState => {
    console.log('processing', event);
    switch (event.type) {
        case 'CreateTask':
            return createTaskMutateState(state, event);
        case 'UpdateTask':
            return updateTaskMutateState(state, event);
        case 'DeleteTask':
            return deleteTaskMutateState(state, event);
        case 'StartTask':
            return startTaskMutateState(state, event);
        case 'CompleteTask':
            return completeTaskMutateState(state, event);
        case 'RemoveTaskOwner':
            return removeTaskOwnerMutateState(state, event);
        case 'UpdateActiveTeam':
            return updateActiveTeamMutateState(state, event);
        case 'CreateTeam':
            return createTeamMutateState(state, event);
    }
};

function updateTask(
    targetTaskId: number | string,
    oldTask: Task,
    taskStatus: TaskStatus,
): Task {
    if (oldTask.id === targetTaskId) {
        return Object.assign<any, Task, Partial<Task>>({}, oldTask, {
            status: taskStatus,
            availableActions: getActions(taskStatus),
        });
    } else {
        return oldTask;
    }
}

function replaceTask(
    newTask: Task,
    oldTask: Task,
    taskStatus: TaskStatus,
): Task {
    if (oldTask.id === newTask.id) {
        return Object.assign({}, newTask, {
            status: taskStatus,
            availableActions: getActions(taskStatus),
        });
    } else {
        return oldTask;
    }
}
