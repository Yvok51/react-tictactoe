import { all } from 'redux-saga/effects';
import { watchGamesFetch } from './gamesFetchSaga';
import { watchSaveCurrentGame } from './saveCurrentGameSaga';
import { watchCurrentGameFetch } from './currentGameFetchSaga';
import { watchGamesDelete } from './gamesDeleteSaga';

export default function* rootSaga() {
  yield all([watchGamesFetch(), watchSaveCurrentGame(), watchCurrentGameFetch(), watchGamesDelete()]);
}
