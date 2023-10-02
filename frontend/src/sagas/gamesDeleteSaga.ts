import { call, put, takeEvery } from 'redux-saga/effects';
import { gameDeleteFailed, gameDeleteStart, gameDeleteSucceded, gameFetchStart } from '../features/games/gamesSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import { APIType, deleteGame } from '../api/api';

const gameDeleteStartType = gameDeleteStart(0).type;

export function* gamesDelete(action: PayloadAction<number>) {
  try {
    const id = action.payload;
    const response: APIType<typeof deleteGame> = yield call(deleteGame, id);
    if (response.status === 'success') {
      yield put(gameDeleteSucceded());
      yield put(gameFetchStart()); // get new list of games
    } else {
      yield put(gameDeleteFailed(response.message));
    }
  } catch (error: any) {
    yield put(gameDeleteFailed(error.message));
  }
}

export function* watchGamesDelete() {
  yield takeEvery(gameDeleteStartType, gamesDelete);
}
