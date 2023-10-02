import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ExistingGame, Game, PlayerFieldValueT } from '../../components/ticTacToeTypes';
import { RootState } from '../../store';

const initialGame: Game = {
  type: 'new',
  nextTurnIndex: 0,
  turns: [],
};

interface CurrentGameState {
  value: Game;
  state: 'idle' | 'loading' | 'saving' | 'success' | 'error';
  error: null | string;
}

const initialState: CurrentGameState = {
  value: initialGame,
  state: 'idle',
  error: null,
};

interface ClaimPayload {
  rowIdx: number;
  colIdx: number;
  value: PlayerFieldValueT;
}

export interface SavePayload {
  title: string;
  game: Game;
}

export const currentGameSlice = createSlice({
  name: 'currentGame',
  initialState,
  reducers: {
    newGame: state => {
      state.error = null;
      state.state = 'idle';
      state.value = initialGame;
    },
    reset: state => {
      state.value.nextTurnIndex = initialGame.nextTurnIndex;
      state.value.turns = initialGame.turns;
    },
    claimField: (state, action: PayloadAction<ClaimPayload>) => {
      const { rowIdx, colIdx, value } = action.payload;
      const newIndex = state.value.nextTurnIndex + 1;

      state.value.turns.splice(state.value.nextTurnIndex);
      state.value.turns.push({ turn: value, xCoord: colIdx, yCoord: rowIdx });
      state.value.nextTurnIndex = newIndex;
    },
    clickHistory: (state, action: PayloadAction<number>) => {
      state.value.nextTurnIndex = action.payload;
    },

    currGameFetchStart: (state, _: PayloadAction<number>) => {
      state.state = 'loading';
    },
    currGameFetchSucceeded: (state, action: PayloadAction<ExistingGame>) => {
      state.value = action.payload;
      state.state = 'success';
    },
    currGameFetchFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.state = 'error';
    },

    currGameSaveStart: (state, _: PayloadAction<SavePayload>) => {
      state.state = 'saving';
    },
    currGameSaveSucceded: (state, action: PayloadAction<ExistingGame>) => {
      state.value = action.payload;
      state.state = 'success';
    },
    currGameSaveFailed: (state, action: PayloadAction<string>) => {
      state.state = 'error';
      state.error = action.payload;
    },
  },
});

export const {
  newGame,
  reset,
  claimField,
  clickHistory,
  currGameFetchStart,
  currGameFetchSucceeded,
  currGameFetchFailed,
  currGameSaveStart,
  currGameSaveSucceded,
  currGameSaveFailed,
} = currentGameSlice.actions;
export const currentGameSelector = (state: RootState) => state.currentGame;
export default currentGameSlice.reducer;
