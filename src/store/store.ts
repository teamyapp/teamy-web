import {configureStore} from '@reduxjs/toolkit';

import executionMeReducer from './slices/ExecutionPersonal';

const store = configureStore({
    reducer: {
        executionMe: executionMeReducer
    }
});

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;