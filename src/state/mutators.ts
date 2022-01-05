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
    event.task.availableActions = getActions('UPCOMING');
    return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
        teamTasks: state.teamTasks.concat(event.task),
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

// function refreshTeamMutateState(
//     state: IAppState,
//     // event: events.RefreshTeam,
// ): IAppState {
//     let needAttentionTask = event.tasksNeedAttention[0];
//     if (needAttentionTask) {
//         needAttentionTask = replaceTask(
//             needAttentionTask,
//             needAttentionTask,
//             'NEED_ATTENTION',
//         );
//     }
//     return Object.assign<any, IAppState, Partial<IAppState>>({}, state, {
//         currentUserId: event.currentUserId,
//         teamTasks: event.teamTasks.map((task) =>
//             Object.assign<any, Task, Partial<Task>>({}, task, {
//                 availableActions: getActions(task.status),
//             }),
//         ),
//         needAttentionTask: needAttentionTask,
//         // todo: use apollo cli to compile query to TS interfaces to have type hint
//     });
// }

export const mutateState: MutateState<IAppState, events.MutationEvent> = (
    state: IAppState,
    event: events.MutationEvent,
): IAppState => {
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
        // case 'RefreshTeam':
        //     return refreshTeamMutateState(state, event);
    }
};

function updateTask(
    targetTaskId: number,
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
