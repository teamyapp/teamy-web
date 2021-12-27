import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TeamStatus } from '../../entity/teamStatus';

const initialState: TeamStatus = {
    upcomingTasks: [],
    inProgressTasks: [],
    deliveredTasks: [],
};

const slice = createSlice({
    name: 'TeamStatus',
    initialState,
    reducers: {
        updateTeamStatus(state: TeamStatus, action: PayloadAction<TeamStatus>) {
            state.upcomingTasks = action.payload.upcomingTasks;
            state.inProgressTasks = action.payload.inProgressTasks;
            state.deliveredTasks = action.payload.deliveredTasks;
        },
    },
});

export const { updateTeamStatus } = slice.actions;

export default slice.reducer;
