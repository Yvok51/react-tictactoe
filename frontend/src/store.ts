import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import currentGameReducer from './features/currentGame/currentGameSlice';

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
    reducer: {
        currentGame: currentGameReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
