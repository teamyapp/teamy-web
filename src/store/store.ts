import { configureStore } from '@reduxjs/toolkit';

import personalStatusReducer from './slices/PersonalStatus';
import teamStatusReducer from './slices/TeamStatus';

const store = configureStore({
    reducer: {
        personalStatus: personalStatusReducer,
        teamStatus: teamStatusReducer,
    },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
