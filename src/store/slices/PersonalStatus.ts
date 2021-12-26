import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import PersonalStatus from '../../entity/personalStatus';
import Task from '../../entity/task';

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
            state.needAttentionTask = action.payload;
        },
        clearNeedAttentionTask(state: PersonalStatus) {
            state.needAttentionTask = undefined;
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
            state.needAttentionTask = action.payload.needAttentionTask;
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
