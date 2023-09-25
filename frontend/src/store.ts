import { configureStore } from "@reduxjs/toolkit";
import historyReducer from './features/history/history';

export const store = configureStore({
    reducer: {
        history: historyReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
