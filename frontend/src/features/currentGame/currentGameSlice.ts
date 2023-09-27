import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Game, PlayerFieldValueT } from "../../components/ticTacToeTypes";
import { RootState } from "../../store";

const initialGame: Game = {
  nextTurnIndex: 0,
  turns: [],
};

interface GameState {
    value: Game;
}

const initialState: GameState = {
    value: initialGame,
}

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
            state.value = initialGame;
        },
        claimField: (state, action: PayloadAction<ClaimActionPayload>) => {
            const {rowIdx, colIdx, value} = action.payload;
            const newIndex = state.value.nextTurnIndex + 1;

            state.value.turns.splice(state.value.nextTurnIndex);
            state.value.turns.push({turn: value, x_coord: colIdx, y_coord: rowIdx});
            state.value.nextTurnIndex = newIndex;
        },
        clickHistory: (state, action: PayloadAction<number>) => {
            state.value.nextTurnIndex = action.payload;
        },
    }
});

export const { reset, claimField, clickHistory } = currentGameSlice.actions;
export const currentGameSelector = (state: RootState) => state.currentGame.value;
export default currentGameSlice.reducer;
