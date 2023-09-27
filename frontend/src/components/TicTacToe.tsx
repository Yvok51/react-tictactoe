import React from 'react';
import { useAppSelector, useAppDispatch } from '../reduxHooks';
import { currentGameSelector, reset, claimField } from '../features/currentGame/currentGameSlice';
import { FieldValue, playerToValue, previousPlayer, FieldValueT, PlayerT } from './ticTacToeTypes';
import { getCurrentField, getCurrentPlayer } from '../features/currentGame/constructField';
import { History } from './History';
import { GamesList } from './GamesList';
import './TicTacToe.css';

export default function TicTacToe() {
  const currentGame = useAppSelector(currentGameSelector);
  const dispatch = useAppDispatch();

  const turn = getCurrentPlayer(currentGame);
  const field = getCurrentField(currentGame);

  const previousTurn = previousPlayer(turn);
  const gameOver = playerWon(previousTurn, field);
  const draw = currentGame.nextTurnIndex == 9 && !gameOver;

  function onClickField(rowIdx: number, cellIdx: number) {
    return (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (field[rowIdx][cellIdx] != FieldValue.Nothing) {
        return;
      }

      if (gameOver || draw) {
        return;
      }

      dispatch(claimField({ rowIdx: rowIdx, colIdx: cellIdx, value: playerToValue(turn) }));
    };
  }

  const fieldsHtml = field.map((row, rIdx) => (
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

  let turnText = `${turn}'s turn`;
  if (gameOver) {
    turnText = `Player ${previousTurn} won!`;
  } else if (draw) {
    turnText = 'Draw!';
  }

  return (
    <div className="tic-tac-toe">
      <GamesList />
      <section className="t-play-area">
        <div className="t-field">{fieldsHtml}</div>
        <div className="t-turn">
          <p>{turnText}</p>
        </div>
        <button onClick={_ => dispatch(reset())} className="t-reset-btn t-btn">
          Reset
        </button>
      </section>
      <History currentGame={currentGame} />
    </div>
  );
}

function playerWon(player: PlayerT, field: FieldValueT[][]) {
  const FieldSize = field.length;
  const NeededConsecutiveFields = FieldSize;
  const wantedFieldValue = playerToValue(player);
  const updateConsecutive = (consecutiveFields: number, field: FieldValueT) =>
    field == wantedFieldValue ? consecutiveFields + 1 : 0;

  // check rows
  for (const row of field) {
    let consecutiveFields = 0;
    for (const value of row) {
      consecutiveFields = updateConsecutive(consecutiveFields, value);
      if (consecutiveFields == NeededConsecutiveFields) {
        return true;
      }
    }
  }
  // check columns
  for (let j = 0; j < FieldSize; j++) {
    let consecutiveFields = 0;
    for (let i = 0; i < FieldSize; i++) {
      consecutiveFields = updateConsecutive(consecutiveFields, field[i][j]);
      if (consecutiveFields == NeededConsecutiveFields) {
        return true;
      }
    }
  }
  // check diagonals
  let consecutiveFields = 0;
  for (let i = 0; i < FieldSize; i++) {
    consecutiveFields = updateConsecutive(consecutiveFields, field[i][i]);
    if (consecutiveFields == NeededConsecutiveFields) {
      return true;
    }
  }
  consecutiveFields = 0;
  for (let i = 0; i < FieldSize; i++) {
    consecutiveFields = updateConsecutive(consecutiveFields, field[i][FieldSize - i - 1]);
    if (consecutiveFields == NeededConsecutiveFields) {
      return true;
    }
  }

  return false;
}
