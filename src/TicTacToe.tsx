import React from 'react';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { historySelector, reset, claimField, clickHistory } from './features/history/history';
import { Player, FieldValue, Field } from './ticTacToeTypes';
import './TicTacToe.css';

export default function TicTacToe() {
  const history = useAppSelector(historySelector);
  const dispatch = useAppDispatch();

  const currState = history.states[history.index];
  const turn = currState.turn;
  const field = currState.field;

  const previousTurn = previousPlayer(turn);
  const gameOver = playerWon(previousTurn, field);
  const draw = history.index == 9 && !gameOver;

  function onClickField(rowIdx: number, cellIdx: number) {
    return (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (field.fieldItems[rowIdx][cellIdx] != FieldValue.Nothing) {
        return;
      }

      if (gameOver || draw) {
        return;
      }

      dispatch(
        claimField({ rowIdx: rowIdx, colIdx: cellIdx, value: playerToValue(turn), nextPlayer: nextPlayer(turn) }),
      );
    };
  }

  const fieldsHtml = field.fieldItems.map((row, rIdx) => (
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

  const historyHtml = history.states.map((state, idx) => {
    const currentTime = idx == history.index;
    const cssClass = currentTime ? 't-history-highlight' : '';
    return (
      <tr key={idx} onClick={_ => dispatch(clickHistory(idx))} className={cssClass}>
        <td className="t-history-cell">{idx}</td>
        <td className="t-history-cell">{state.turn}</td>
      </tr>
    );
  });

  let turnText = `${turn}'s turn`;
  if (gameOver) {
    turnText = `Player ${previousTurn} won!`;
  } else if (draw) {
    turnText = 'Draw!';
  }

  return (
    <div className="tic-tac-toe">
      <section className="t-play-area">
        <div className="t-field">{fieldsHtml}</div>
        <div className="t-turn">
          <p>{turnText}</p>
        </div>
        <button onClick={_ => dispatch(reset())} className="t-reset-btn">
          Reset
        </button>
      </section>
      <section className="t-history-area">
        <table className="t-history">
          <thead className="t-history-head">
            <td className="t-history-cell">Turn Number</td>
            <td className="t-history-cell">Player</td>
          </thead>
          {historyHtml}
        </table>
      </section>
    </div>
  );
}

function nextPlayer(player: Player) {
  if (player == Player.Circle) return Player.Cross;
  return Player.Circle;
}

function previousPlayer(player: Player) {
  return nextPlayer(player);
}

function playerWon(player: Player, field: Field) {
  const NeededConsecutiveFields = field.size;
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
  consecutiveFields = 0;
  for (let i = 0; i < field.size; i++) {
    consecutiveFields = updateConsecutive(consecutiveFields, field.fieldItems[i][field.size - i - 1]);
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
