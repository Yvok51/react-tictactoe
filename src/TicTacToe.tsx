import React, { useState } from 'react';
import './TicTacToe.css';

enum Player {
  Circle = 'Circle',
  Cross = 'Cross',
}

enum FieldValue {
  Circle = 'O',
  Cross = 'X',
  Nothing = '',
}

type Field = {
  size: number;
  fieldItems: FieldValue[][];
};

type State = {
  turn: Player;
  field: Field;
};

type History = {
  index: number;
  states: State[];
};

const FieldSize = 3;
const initialField: FieldValue[][] = Array(FieldSize)
  .fill(0)
  .map(_ => Array(FieldSize).fill(FieldValue.Nothing));

const initialHistory = {
  index: 0,
  states: [{ turn: Player.Circle, field: { size: FieldSize, fieldItems: initialField } }],
};

export default function TicTacToe() {
  const [history, setHistory] = useState<History>(initialHistory);

  const currState = history.states[history.index];
  const turn = currState.turn;
  const field = currState.field;

  const previousTurn = previousPlayer(turn);
  const gameOver = playerWon(previousTurn, field);

  function resetState() {
    setHistory(initialHistory);
  }

  function onClickField(rowIdx: number, cellIdx: number) {
    return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (field.fieldItems[rowIdx][cellIdx] != FieldValue.Nothing) {
        return;
      }

      if (gameOver) {
        return;
      }

      const newField = changeField(field, rowIdx, cellIdx, playerToValue(turn));
      const newTurn = nextPlayer(turn);
      const newIndex = history.index + 1;

      const newStates = [...history.states];
      newStates.splice(newIndex);
      newStates.push({ turn: newTurn, field: newField });

      const newHistory = { index: newIndex, states: newStates };
      console.log(newHistory);

      setHistory(newHistory);
    };
  }

  const htmlField = field.fieldItems.map((row, rIdx) => (
    <div key={rIdx} className="t-row">
      {row.map((cell, cIdx) => {
        const clickField = onClickField(rIdx, cIdx);
        return (
          <div onClick={clickField} key={cIdx} className="t-cell">
            <p>{cell}</p>
          </div>
        );
      })}
    </div>
  ));

  const turnText = gameOver ? `Player ${previousTurn} won!` : `${turn}'s turn`;

  return (
    <section>
      <div className="t-field">{htmlField}</div>
      <div className="t-turn">
        <p>{turnText}</p>
      </div>
      <button onClick={resetState} className="t-reset-btn">
        Reset
      </button>
    </section>
  );
}

function changeField(field: Field, rowIdx: number, cellIdx: number, value: FieldValue) {
  const fieldCopy: Field = { ...field, fieldItems: field.fieldItems.map(x => x.slice()) };
  fieldCopy.fieldItems[rowIdx][cellIdx] = value;
  return fieldCopy;
}

function nextPlayer(player: Player) {
  if (player == Player.Circle) return Player.Cross;
  return Player.Circle;
}

function previousPlayer(player: Player) {
  return nextPlayer(player);
}

const NeededConsecutiveFields = FieldSize;
function playerWon(player: Player, field: Field) {
  const wantedFieldValue = playerToValue(player);
  const updateConsecutive = (consecutiveFields: number, field: FieldValue) =>
    field == wantedFieldValue ? consecutiveFields + 1 : 0;

  // check rows
  for (const row of field.fieldItems) {
    let consecutiveFields = 0;
    for (const value of row) {
      consecutiveFields = updateConsecutive(consecutiveFields, value);
      if (consecutiveFields == NeededConsecutiveFields) {
        return true;
      }
    }
  }
  // check columns
  for (let j = 0; j < field.size; j++) {
    let consecutiveFields = 0;
    for (let i = 0; i < field.size; i++) {
      consecutiveFields = updateConsecutive(consecutiveFields, field.fieldItems[i][j]);
      if (consecutiveFields == NeededConsecutiveFields) {
        return true;
      }
    }
  }
  // check diagonals
  let consecutiveFields = 0;
  for (let i = 0; i < field.size; i++) {
    consecutiveFields = updateConsecutive(consecutiveFields, field.fieldItems[i][i]);
    if (consecutiveFields == NeededConsecutiveFields) {
      return true;
    }
  }

  return false;
}

function playerToValue(player: Player) {
  if (player == Player.Circle) return FieldValue.Circle;
  return FieldValue.Cross;
}
