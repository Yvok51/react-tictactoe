import { call, put, takeLatest } from 'redux-saga/effects';
import { gameFetchStart, gameFetchSucceeded, gameFetchFailed } from '../features/games/gamesSlice';
import { getGames, APIType } from '../api/api';

const gamesFetchStartType = gameFetchStart().type;

export function* gamesFetch() {
  try {
    const fetchResult: APIType<typeof getGames> = yield call(getGames);
    if (fetchResult.status === 'success') {
      yield put(gameFetchSucceeded(fetchResult.data));
    } else {
      yield put(gameFetchFailed(fetchResult.message));
    }
  } catch (error: any) {
    yield put(gameFetchFailed(error.message));
  }
}

export function* watchGamesFetch() {
  yield takeLatest(gamesFetchStartType, gamesFetch);
}
