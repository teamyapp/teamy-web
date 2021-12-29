import {
    CompleteTaskEvent,
    CreateTaskEvent,
    DeleteTaskEvent,
    MutationEvent,
    RefreshTeamEvent,
    StartTaskEvent,
    UpdateTaskEvent,
} from '@entity/events';
import { Task } from '@entity/task';
import { getActions } from '@entity/taskAction';
import { TaskStatus } from '@entity/taskStatus';
import { MutateState } from '@store/store';
import { IAppState } from './state';

function createTaskMutateState(
    state: IAppState,
    event: CreateTaskEvent,
): IAppState {
    event.task.availableActions = getActions(TaskStatus.Upcoming);
    return Object.assign({}, state, {
        teamStatus: Object.assign({}, state.teamStatus, {
            upcomingTasks: state.teamStatus.upcomingTasks.concat(event.task),
            inProgressTasks: state.teamStatus.inProgressTasks,
            deliveredTasks: state.teamStatus.deliveredTasks,
        }),
    });
}

function updateTaskMutateState(
    state: IAppState,
    event: UpdateTaskEvent,
): IAppState {
    const upcomingTasks = state.teamStatus.upcomingTasks.map((oldTask) =>
        replaceTask(event.task, oldTask, TaskStatus.Upcoming),
    );
    const inProgressTasks = state.teamStatus.inProgressTasks.map((oldTask) =>
        replaceTask(event.task, oldTask, TaskStatus.InProgress),
    );
    const deliveredTasks = state.teamStatus.deliveredTasks.map((oldTask) =>
        replaceTask(event.task, oldTask, TaskStatus.Delivered),
    );
    let needAttentionTask = state.needAttentionTask;
    if (needAttentionTask) {
        needAttentionTask = replaceTask(
            event.task,
            needAttentionTask,
            TaskStatus.NeedAttention,
        );
    }
    return Object.assign({}, state, {
        teamStatus: Object.assign({}, state.teamStatus, {
            upcomingTasks: upcomingTasks,
            inProgressTasks: inProgressTasks,
            deliveredTasks: deliveredTasks,
        }),
        needAttentionTask: needAttentionTask,
    });
}

function deleteTaskMutateState(
    state: IAppState,
    event: DeleteTaskEvent,
): IAppState {
    const upcomingTasks = state.teamStatus.upcomingTasks.filter(
        (task) => task.id !== event.taskId,
    );
    const inProgressTasks = state.teamStatus.inProgressTasks.filter(
        (task) => task.id !== event.taskId,
    );
    const deliveredTasks = state.teamStatus.deliveredTasks.filter(
        (task) => task.id !== event.taskId,
    );
    return Object.assign({}, state, {
        teamStatus: Object.assign({}, state.teamStatus, {
            upcomingTasks: upcomingTasks,
            inProgressTasks: inProgressTasks,
            deliveredTasks: deliveredTasks,
        }),
        needAttentionTask:
            state.needAttentionTask?.id === event.taskId
                ? undefined
                : state.needAttentionTask,
    });
}

function startTaskMutateState(
    state: IAppState,
    event: StartTaskEvent,
): IAppState {
    let [inProgressTasks, upcomingTasks] = moveTo(
        state.teamStatus.inProgressTasks,
        state.teamStatus.upcomingTasks,
        (task) => task.id === state.needAttentionTask?.id,
        (task) => {
            return Object.assign({}, task, {
                // TODO: assign appropriate actions
                availableActions: getActions(TaskStatus.Upcoming),
            });
        },
    );
    [upcomingTasks, inProgressTasks] = moveTo(
        upcomingTasks,
        inProgressTasks,
        (task) => task.id === event.taskId,
        (task) => {
            return Object.assign({}, task, {
                availableActions: getActions(TaskStatus.InProgress),
            });
        },
    );
    const needAttentionTask = inProgressTasks.filter(
        (task) => task.id === event.taskId,
    )[0];
    needAttentionTask.availableActions = getActions(TaskStatus.NeedAttention);
    return Object.assign({}, state, {
        teamStatus: Object.assign({}, state.teamStatus, {
            upcomingTasks: upcomingTasks,
            inProgressTasks: inProgressTasks,
            deliveredTasks: state.teamStatus.deliveredTasks,
        }),
        needAttentionTask: needAttentionTask,
    });
}

function completeTaskMutateState(
    state: IAppState,
    event: CompleteTaskEvent,
): IAppState {
    let [inProgressTasks, deliveredTasks] = moveTo(
        state.teamStatus.inProgressTasks,
        state.teamStatus.deliveredTasks,
        (task) => task.id === event.taskId,
        (task) => {
            return Object.assign({}, task, {
                availableActions: getActions(TaskStatus.Delivered),
            });
        },
    );
    return Object.assign({}, state, {
        teamStatus: Object.assign({}, state.teamStatus, {
            upcomingTasks: state.teamStatus.upcomingTasks,
            inProgressTasks: inProgressTasks,
            deliveredTasks: deliveredTasks,
        }),
        needAttentionTask: undefined,
    });
}

function refreshTeamMutateState(
    state: IAppState,
    event: RefreshTeamEvent,
): IAppState {
    let needAttentionTask = event.tasksNeedAttention[0];
    if (needAttentionTask) {
        needAttentionTask = replaceTask(
            needAttentionTask,
            needAttentionTask,
            TaskStatus.NeedAttention,
        );
    }
    return Object.assign({}, state, {
        currentUserId: event.currentUserId,
        teamStatus: {
            upcomingTasks: event.upcomingTasks.map((task) =>
                replaceTask(task, task, TaskStatus.Upcoming),
            ),
            inProgressTasks: event.inProgressTasks.map((task) =>
                replaceTask(task, task, TaskStatus.InProgress),
            ),
            deliveredTasks: event.deliveredTasks.map((task) =>
                replaceTask(task, task, TaskStatus.Delivered),
            ),
        },
        needAttentionTask: needAttentionTask,
        // todo: use apollo cli to compile query to TS interfaces to have type hint
    });
}

export const mutateState: MutateState<IAppState, MutationEvent> = (
    state: IAppState,
    event: MutationEvent,
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
        case 'RefreshTeam':
            return refreshTeamMutateState(state, event);
    }
};

function replaceTask(
    newTask: Task,
    oldTask: Task,
    taskStatus: TaskStatus,
): Task {
    if (oldTask.id === newTask.id) {
        return Object.assign({}, newTask, {
            availableActions: getActions(taskStatus),
        });
    } else {
        return oldTask;
    }
}

function moveTo<T>(
    array1: Array<T>,
    array2: Array<T>,
    find: (element: T) => boolean,
    transform: (element: T) => T,
): [Array<T>, Array<T>] {
    let toBeMoved = array1.filter(find);
    let newArray1 = array1.filter((ele) => !find(ele));
    return [newArray1, array2.concat(toBeMoved.map(transform))];
}
