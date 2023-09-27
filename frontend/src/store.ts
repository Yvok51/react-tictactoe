import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import currentGameReducer from './features/currentGame/currentGameSlice';
import gamesReducer from './features/games/gamesSlice';

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: {
    currentGame: currentGameReducer,
    games: gamesReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
