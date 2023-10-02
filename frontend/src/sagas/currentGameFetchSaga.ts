import { call, put, takeLatest } from 'redux-saga/effects';
import {
  currGameFetchFailed,
  currGameFetchStart,
  currGameFetchSucceeded,
} from '../features/currentGame/currentGameSlice';
import { APIType, GameWithTurnsResponse, TurnResponse, getGame } from '../api/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { ExistingGame, Turn } from '../components/ticTacToeTypes';

const currGameFetchStartType = currGameFetchStart(0).type;

export function* currentGameFetch(action: PayloadAction<number>) {
  try {
    const fetchResult: APIType<typeof getGame> = yield call(getGame, action.payload);
    if (fetchResult.status === 'success') {
      yield put(currGameFetchSucceeded(responseToStateType(fetchResult.data)));
    } else {
      yield put(currGameFetchFailed(fetchResult.message));
    }
  } catch (error: any) {
    yield put(currGameFetchFailed(error.message));
  }
}

export function* watchCurrentGameFetch() {
  yield takeLatest(currGameFetchStartType, currentGameFetch);
}

export function responseToStateType(response: GameWithTurnsResponse): ExistingGame {
  const turns = convertedAndSortedTurns(response.turns);
  return {
    type: 'existing',
    id: response.id,
    turns,
    title: response.title,
    nextTurnIndex: turns.length,
  };
}

function convertedAndSortedTurns(responseTurns: TurnResponse[]): Turn[] {
  return responseTurns
    .sort((a, b) => a.turnOrder - b.turnOrder)
    .map<Turn>(res => ({ turn: res.turn, xCoord: res.xCoord, yCoord: res.yCoord }));
}
