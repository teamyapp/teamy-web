import { MutateState } from '@lib/store/localStore';

import * as events from '@core/entity/events';
import { Task } from '@core/entity/task';
import { getActions } from '@core/entity/taskAction';
import { TaskStatus } from '@core/entity/taskStatus';

import { IAppState } from './state';

function createTaskMutateState(
    state: IAppState,
    event: events.CreateTask,
): IAppState {
    let task: Task = Object.assign({}, event.task, {
        // temperary id until the server creates an id for it
        // todo: in the future, need a distributed id solution
        // uuid+user-id is a good solution
        id: "-1",
        availableActions: getActions('UPCOMING'),
        status: 'UPCOMING'
    })
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

export const mutateState: MutateState<IAppState, events.MutationEvent> = (
    state: IAppState,
    event: events.MutationEvent,
): IAppState => {
    console.log("handling", event);
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
    }
};

function updateTask(
    targetTaskId: number| string,
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
