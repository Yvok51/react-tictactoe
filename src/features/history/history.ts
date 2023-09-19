import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Player, FieldValue, History } from "../../ticTacToeTypes";
import { RootState } from "../../store";

const FieldSize = 3;
const initialField: FieldValue[][] = Array(FieldSize)
  .fill(0)
  .map(_ => Array(FieldSize).fill(FieldValue.Nothing));

const initialHistory: History = {
  index: 0,
  states: [{ turn: Player.Circle, field: { size: FieldSize, fieldItems: initialField } }],
};

interface HistoryState {
    value: History;
}

const initialState: HistoryState = {
    value: initialHistory,
}

interface ClaimActionPayload {
    rowIdx: number;
    colIdx: number;
    value: FieldValue;
    nextPlayer: Player;
}

export const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        reset: state => {
            state.value = initialHistory;
        },
        claimField: (state, action: PayloadAction<ClaimActionPayload>) => {
            const currentState = state.value.states[state.value.index];
            const newIndex = state.value.index + 1;

            const newFieldItems = currentState.field.fieldItems.map(x => x.slice())
            newFieldItems[action.payload.rowIdx][action.payload.colIdx] = action.payload.value;

            state.value.states.splice(newIndex);
            state.value.index = newIndex;

            state.value.states.push({
                turn: action.payload.nextPlayer,
                field: { size: currentState.field.size, fieldItems: newFieldItems },
            });
        },
        clickHistory: (state, action: PayloadAction<number>) => {
            state.value.index = action.payload;
        },
    }
});

export const {reset, claimField, clickHistory} = historySlice.actions;
export const historySelector = (state: RootState) => state.history.value;
export default historySlice.reducer;
