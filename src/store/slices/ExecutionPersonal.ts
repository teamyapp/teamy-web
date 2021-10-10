import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Task from '../../entity/Task';
import {TaskAction} from '../../entity/TaskAction';

const now = Date.now();

const taskNeedAttention: Task = {
    id: 4,
    goal: 'Productionise the core algorithm for graph based access control system',
    dueAt: now,
    effort: 10,
    availableActions: [
        TaskAction.MarkComplete,
        TaskAction.MarkBlocked
    ]
};

const upcomingTasks: Task[] = [
    {
        id: 1,
        goal: 'Create gRPC APIs for permission and resource relationship CRUDs',
        dueAt: now,
        effort: 3,
        availableActions: [
            TaskAction.Start,
            TaskAction.UpdateAssignee,
            TaskAction.Delete
        ]
    },
    {
        id: 2,
        goal: 'Create gRPC API for hasPermission',
        dueAt: now,
        effort: 4,
        availableActions: [
            TaskAction.Start,
            TaskAction.UpdateAssignee,
            TaskAction.Delete
        ]
    },
    {
        id: 3,
        goal: 'Create gRPC API for the permission CRUDs',
        dueAt: now,
        effort: 5,
        availableActions: [
            TaskAction.Start,
            TaskAction.UpdateAssignee,
            TaskAction.Delete
        ]
    }
];

const deliveredTasks: Task[] = [
    {
        id: 1,
        goal: 'Add unit tests for the core algorithm to make sure edge cases are covered',
        dueAt: now,
        effort: 3,
        availableActions: []
    },
    {
        id: 2,
        goal: 'Update Access Control design doc to use the latest tree path algorithm',
        dueAt: now,
        effort: 4,
        availableActions: []
    },
    {
        id: 3,
        goal: 'Update DB schema diagram in the access control design doc',
        dueAt: now,
        effort: 5,
        availableActions: []
    }
];

interface ExecutionPersonalState {
    needAttention?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}

const initialState: ExecutionPersonalState = {
    needAttention: taskNeedAttention,
    upcomingTasks: upcomingTasks,
    deliveredTasks: deliveredTasks
};

const slice = createSlice({
    name: 'executionPersonal',
    initialState,
    reducers: {
        setNeedAttentionTask(state: ExecutionPersonalState, action: PayloadAction<Task>) {
            state.needAttention = action.payload;
        },
        clearNeedAttentionTask(state: ExecutionPersonalState) {
            state.needAttention = undefined;
        },
        addIncomingTask(state: ExecutionPersonalState, action: PayloadAction<Task>) {
            state.upcomingTasks.concat(action.payload);
        },
        removeIncomingTask(state: ExecutionPersonalState, action: PayloadAction<number>) {
            state.deliveredTasks = state
                .deliveredTasks
                .filter((task: Task) => task.id !== action.payload);
        }
    }
});

export const {
    setNeedAttentionTask,
    clearNeedAttentionTask,
    addIncomingTask,
    removeIncomingTask
} = slice.actions;

export default slice.reducer;