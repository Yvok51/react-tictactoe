import React from 'react';
import { useAppSelector, useAppDispatch } from '../reduxHooks';
import { currentGameSelector, reset, claimField, newGame } from '../features/currentGame/currentGameSlice';
import { FieldValue, playerToValue, previousPlayer, FieldValueT, PlayerT } from './ticTacToeTypes';
import { getCurrentField, getCurrentPlayer } from '../features/currentGame/constructField';
import { History } from './History';
import { GamesList } from './GamesList';
import { ErrorBox } from './ErrorBox';
import './TicTacToe.css';

export default function TicTacToe() {
  const currentGameState = useAppSelector(currentGameSelector);
  const dispatch = useAppDispatch();

  let content;

  if (currentGameState.state === 'loading') {
    content = <p>Loading...</p>;
  } else {
    const currentGame = currentGameState.value;

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

    content = (
      <React.Fragment>
        <div className="t-field">{fieldsHtml}</div>
        <div className="t-turn">
          <p>{turnText}</p>
        </div>
        <div className="full-screen-row">
          <button onClick={() => dispatch(reset())} className="t-reset-btn t-btn">
            Reset
          </button>
          <button onClick={() => dispatch(newGame())} className="t-reset-btn t-btn">
            New Game
          </button>
        </div>
      </React.Fragment>
    );
  }

  if (currentGameState.state === 'error') {
    content = (
      <React.Fragment>
        <ErrorBox errorMessage={currentGameState.error} />
        {content}
      </React.Fragment>
    );
  }

  const canSave = currentGameState.state !== 'loading' && currentGameState.state !== 'saving';
  const currentId = currentGameState.value.type === 'existing' ? currentGameState.value.id : -1;

  return (
    <div className="tic-tac-toe">
      <GamesList />
      <section className="t-play-area">{content}</section>
      <History key={currentId} currentGame={currentGameState.value} canSave={canSave} />
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
