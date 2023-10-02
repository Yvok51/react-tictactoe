import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { Game } from '../components/ticTacToeTypes';
import { APIType, CreateGameSchema, createGame, updateGame } from '../api/api';
import {
  SavePayload,
  currGameSaveFailed,
  currGameSaveStart,
  currGameSaveSucceded,
} from '../features/currentGame/currentGameSlice';
import { gameFetchStart } from '../features/games/gamesSlice';
import { responseToStateType } from './currentGameFetchSaga';

const currGameSaveStartType = currGameSaveStart({ title: '', game: { type: 'new', turns: [], nextTurnIndex: 0 } }).type;

export function* saveCurrentGame(action: PayloadAction<SavePayload>) {
  const { title, game } = action.payload;
  const gameSchema = toSchema(title, game);
  try {
    switch (game.type) {
      case 'existing':
        const updateResponse: APIType<typeof updateGame> = yield call(updateGame, game.id, gameSchema);
        if (updateResponse.status === 'success') {
          yield put(currGameSaveSucceded(responseToStateType(updateResponse.data)));
          yield put(gameFetchStart()); // update the list of games
        } else {
          yield put(currGameSaveFailed(updateResponse.message));
        }
        return;
      case 'new':
        const createResponse: APIType<typeof createGame> = yield call(createGame, gameSchema);
        if (createResponse.status === 'success') {
          yield put(currGameSaveSucceded(responseToStateType(createResponse.data)));
          yield put(gameFetchStart()); // update the list of games
        } else {
          yield put(currGameSaveFailed(createResponse.message));
        }
        return;
    }
  } catch (error: any) {
    yield put(currGameSaveFailed(error.message));
  }
}

export function* watchSaveCurrentGame() {
  yield takeLatest(currGameSaveStartType, saveCurrentGame);
}

function toSchema(title: string, game: Game): CreateGameSchema {
  return {
    title,
    turns: game.turns,
  };
}
