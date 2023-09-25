
export enum Player {
  Circle = 'Circle',
  Cross = 'Cross',
}

export enum FieldValue {
  Circle = 'O',
  Cross = 'X',
  Nothing = '',
}

export type Field = {
  size: number;
  fieldItems: FieldValue[][];
};

export type State = {
  turn: Player;
  field: Field;
};

export type History = {
  index: number;
  states: State[];
};
