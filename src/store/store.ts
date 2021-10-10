import { configureStore } from '@reduxjs/toolkit';

import executionPersonalReducer from './slices/ExecutionPersonal';

const store = configureStore({
    reducer: {
        executionPersonal: executionPersonalReducer,
    },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
