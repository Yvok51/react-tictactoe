import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Game, PlayerFieldValueT } from '../../components/ticTacToeTypes';
import { RootState } from '../../store';

const initialGame: Game = {
  id: null,
  nextTurnIndex: 0,
  turns: [],
};

interface CurrentGameState {
  value: Game;
}

const initialState: CurrentGameState = {
  value: initialGame,
};

interface ClaimActionPayload {
  rowIdx: number;
  colIdx: number;
  value: PlayerFieldValueT;
}

export const currentGameSlice = createSlice({
  name: 'currentGame',
  initialState,
  reducers: {
    reset: state => {
      state.value.nextTurnIndex = initialGame.nextTurnIndex;
      state.value.turns = initialGame.turns;
    },
    claimField: (state, action: PayloadAction<ClaimActionPayload>) => {
      const { rowIdx, colIdx, value } = action.payload;
      const newIndex = state.value.nextTurnIndex + 1;

      state.value.turns.splice(state.value.nextTurnIndex);
      state.value.turns.push({ turn: value, xCoord: colIdx, yCoord: rowIdx });
      state.value.nextTurnIndex = newIndex;
    },
    clickHistory: (state, action: PayloadAction<number>) => {
      state.value.nextTurnIndex = action.payload;
    },
  },
});

export const { reset, claimField, clickHistory } = currentGameSlice.actions;
export const currentGameSelector = (state: RootState) => state.currentGame.value;
export default currentGameSlice.reducer;
