
export const Player = {
  Circle: 'Circle',
  Cross: 'Cross',
} as const;

export const PlayerFieldValue = {
  Circle: 'O',
  Cross: 'X',
} as const;

export const FieldValue = {
  Nothing: '',
  ...PlayerFieldValue
} as const;

type ValueOf<T> = T[keyof T];
export type PlayerT = ValueOf<typeof Player>;
export type PlayerFieldValueT = ValueOf<typeof PlayerFieldValue>;
export type FieldValueT = ValueOf<typeof FieldValue>;

export function playerToValue(player: PlayerT): PlayerFieldValueT {
  if (player == Player.Circle) return FieldValue.Circle;
  return FieldValue.Cross;
}

export function fieldValueToPlayer(value: PlayerFieldValueT): PlayerT
export function fieldValueToPlayer(value: FieldValueT): PlayerT | null {
  switch (value) {
    case FieldValue.Circle:
      return Player.Circle;
    case FieldValue.Cross:
      return Player.Cross;
    case FieldValue.Nothing:
      return null;
  }
}

export function nextPlayer(player: PlayerT): PlayerT {
  if (player == Player.Circle) return Player.Cross;
  return Player.Circle;
}

export function previousPlayer(player: PlayerT): PlayerT {
  return nextPlayer(player);
}

// export type State = {
//   turn: Player;
//   field: Field;
// };

export type Turn = {
  turn: PlayerFieldValueT;
  x_coord: number;
  y_coord: number;
}

export type Game = {
  nextTurnIndex: number;
  turns: Turn[];
};
