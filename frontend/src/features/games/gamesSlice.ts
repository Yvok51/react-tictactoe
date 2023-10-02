import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { GameListing } from '../../components/ticTacToeTypes';

interface GamesState {
  value: GameListing[];
  state: 'idle' | 'loading' | 'deleting' | 'success' | 'error';
  error: string | null;
}

const initialState: GamesState = {
  value: [],
  state: 'idle',
  error: null,
};

export const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    gameFetchStart: state => {
      state.state = 'loading';
    },
    gameFetchSucceeded: (state, action: PayloadAction<GameListing[]>) => {
      state.value = action.payload;
      state.state = 'success';
    },
    gameFetchFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.state = 'error';
    },

    gameDeleteStart: (state, _action: PayloadAction<number>) => {
      state.state = 'deleting';
    },
    gameDeleteSucceded: state => {
      state.state = 'success';
    },
    gameDeleteFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.state = 'error';
    },
  },
});

export const {
  gameFetchStart,
  gameFetchSucceeded,
  gameFetchFailed,
  gameDeleteStart,
  gameDeleteSucceded,
  gameDeleteFailed,
} = gamesSlice.actions;

export const gamesSelector = (state: RootState) => state.games;
export default gamesSlice.reducer;
