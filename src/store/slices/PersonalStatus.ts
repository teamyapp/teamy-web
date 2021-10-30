import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import PersonalStatus from '../../entity/PersonalStatus';
import Task from '../../entity/Task';

const initialState: PersonalStatus = {
    upcomingTasks: [],
    deliveredTasks: [],
};

const slice = createSlice({
    name: 'PersonalStatus',
    initialState,
    reducers: {
        setNeedAttentionTask(
            state: PersonalStatus,
            action: PayloadAction<Task>,
        ) {
            state.taskNeedAttention = action.payload;
        },
        clearNeedAttentionTask(state: PersonalStatus) {
            state.taskNeedAttention = undefined;
        },
        addIncomingTask(state: PersonalStatus, action: PayloadAction<Task>) {
            state.upcomingTasks.concat(action.payload);
        },
        removeIncomingTask(
            state: PersonalStatus,
            action: PayloadAction<number>,
        ) {
            state.deliveredTasks = state.deliveredTasks.filter(
                (task: Task) => task.id !== action.payload,
            );
        },
        updatePersonalStatus(
            state: PersonalStatus,
            action: PayloadAction<PersonalStatus>,
        ) {
            state.upcomingTasks = action.payload.upcomingTasks;
            state.taskNeedAttention = action.payload.taskNeedAttention;
            state.deliveredTasks = action.payload.deliveredTasks;
        },
    },
});

export const {
    setNeedAttentionTask,
    clearNeedAttentionTask,
    addIncomingTask,
    removeIncomingTask,
    updatePersonalStatus,
} = slice.actions;

export default slice.reducer;
