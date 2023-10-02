import { Turn } from '../components/ticTacToeTypes';

const API_URL = 'http://localhost:8080/api/';
function url(relative_url: string) {
  return API_URL + relative_url;
}

interface APISuccess<T> {
  status: 'success';
  data: T;
}

interface APIError {
  status: 'error';
  message: string;
}

export type APIResult<T> = APISuccess<T> | APIError;

export type APIType<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

export type GameResponse = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type GameWithTurnsResponse = GameResponse & { turns: TurnResponse[] };

export type TurnResponse = {
  id: number;
  turnOrder: number;
  turn: 'O' | 'X';
  xCoord: number;
  yCoord: number;
};

export type CreateGameSchema = {
  title: string;
  turns: Turn[];
};

export async function getGames(): Promise<APIResult<GameResponse[]>> {
  let response = await fetch(url('games'));
  let games = await response.json();
  return games;
}

export async function getGame(id: number): Promise<APIResult<GameWithTurnsResponse>> {
  let response = await fetch(url(`games/${id}`));
  let game = await response.json();
  return game;
}

export async function createGame(game: CreateGameSchema): Promise<APIResult<GameWithTurnsResponse>> {
  let response = await json_req(url('games/'), 'POST', JSON.stringify(game));
  let savedGame = await response.json();
  return savedGame;
}

export async function updateGame(id: number, game: CreateGameSchema): Promise<APIResult<GameWithTurnsResponse>> {
  let response = await json_req(url(`games/${id}`), 'PUT', JSON.stringify(game));
  let updatedGame = await response.json();
  return updatedGame;
}

export async function deleteGame(id: number): Promise<APIResult<number>> {
  let response = await fetch(url(`games/${id}`), {
    method: 'DELETE',
  });
  let deleted_id = await response.json();
  return deleted_id;
}

function json_req(url: string, method: string, data: string) {
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  });
}
