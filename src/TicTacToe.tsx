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
  field: FieldValue[][];
};

const FieldSize = 3;
const initialField: FieldValue[][] = Array(FieldSize)
  .fill(0)
  .map(_ => Array(FieldSize).fill(FieldValue.Nothing));

export default function TicTacToe() {
  const [turn, setTurn] = useState<Player>(Player.Circle);
  const [field, setField] = useState<Field>({ size: FieldSize, field: initialField });

  const previousTurn = previousPlayer(turn);
  const gameOver = playerWon(previousTurn, field);

  function resetState() {
    setTurn(Player.Circle);
    setField({ size: FieldSize, field: initialField });
  }

  function claimField(rowIdx: number, celIdx: number) {
    return () => {
      const fieldCopy = { ...field, field: field.field.map(x => x.slice()) };
      fieldCopy.field[rowIdx][celIdx] = turn == Player.Circle ? FieldValue.Circle : FieldValue.Cross;
      setField(fieldCopy);
    };
  }

  function switchPlayer() {
    setTurn(nextPlayer(turn));
  }

  const htmlField = field.field.map((row, rIdx) => (
    <div key={rIdx} className="t-row">
      {row.map((cell, cIdx) => {
        const claim = claimField(rIdx, cIdx);
        const onClickCallback = (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          if (!gameOver && field.field[rIdx][cIdx] == FieldValue.Nothing) {
            claim();
            switchPlayer();
          }
        };
        return (
          <div onClick={onClickCallback} key={cIdx} className="t-cell">
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

function nextPlayer(player: Player) {
  if (player == Player.Circle) return Player.Cross;
  return Player.Circle;
}

function previousPlayer(player: Player) {
  return nextPlayer(player);
}

const NeededConsecutiveFields = FieldSize;
function playerWon(player: Player, field: Field) {
  const wantedFieldValue = player == Player.Circle ? FieldValue.Circle : FieldValue.Cross;
  const updateConsecutive = (consecutiveFields: number, field: FieldValue) =>
    field == wantedFieldValue ? consecutiveFields + 1 : 0;

  // check rows
  for (const row of field.field) {
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
      consecutiveFields = updateConsecutive(consecutiveFields, field.field[i][j]);
      if (consecutiveFields == NeededConsecutiveFields) {
        return true;
      }
    }
  }
  // check diagonals
  let consecutiveFields = 0;
  for (let i = 0; i < field.size; i++) {
    consecutiveFields = updateConsecutive(consecutiveFields, field.field[i][i]);
    if (consecutiveFields == NeededConsecutiveFields) {
      return true;
    }
  }

  return false;
}
