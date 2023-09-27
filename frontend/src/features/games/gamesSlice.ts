import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { GameListing } from '../../components/ticTacToeTypes';

interface GamesState {
  value: GameListing[];
  state: 'idle' | 'loading' | 'success' | 'error';
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
  reducers: {},
});

export const gamesSelector = (state: RootState) => state.games.value;
export default gamesSlice.reducer;
