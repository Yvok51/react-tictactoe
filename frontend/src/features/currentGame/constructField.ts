import {
  Player,
  PlayerT,
  fieldValueToPlayer,
  nextPlayer,
  FieldValueT,
  FieldValue,
  Game,
} from '../../components/ticTacToeTypes';

const initialField: FieldValueT[][] = [
  [FieldValue.Nothing, FieldValue.Nothing, FieldValue.Nothing],
  [FieldValue.Nothing, FieldValue.Nothing, FieldValue.Nothing],
  [FieldValue.Nothing, FieldValue.Nothing, FieldValue.Nothing],
];

export const FirstPlayer: PlayerT = Player.Circle;

export function getCurrentField(game: Game): FieldValueT[][] {
  const startField = initialField.slice().map(x => x.slice());
  for (let i = 0; i < game.nextTurnIndex; i++) {
    const turn = game.turns[i];
    startField[turn.yCoord][turn.xCoord] = turn.turn;
  }
  return startField;
}

export function getCurrentPlayer(game: Game): PlayerT {
  if (game.nextTurnIndex > 0) {
    return nextPlayer(fieldValueToPlayer(game.turns[game.nextTurnIndex - 1].turn));
  }
  return FirstPlayer;
}
