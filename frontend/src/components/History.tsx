import { useAppDispatch } from '../reduxHooks';
import { clickHistory, currGameSaveStart } from '../features/currentGame/currentGameSlice';
import { PlayerT, fieldValueToPlayer, nextPlayer } from './ticTacToeTypes';
import { Game } from './ticTacToeTypes';
import { FirstPlayer } from '../features/currentGame/constructField';
import './History.css';
import { useState } from 'react';

interface HistoryProps {
  currentGame: Game;
  canSave: boolean;
}

export function History({ currentGame, canSave }: HistoryProps) {
  const [title, setTitle] = useState(currentGame.type === 'existing' ? currentGame.title : '');
  const dispatch = useAppDispatch();

  const canSendSave = title && canSave;

  function saveGame(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (canSendSave) {
      dispatch(currGameSaveStart({ title, game: currentGame }));
    }
  }

  const historyHtml = currentGame.turns.map((turn, idx) => {
    const currentTime = idx == currentGame.nextTurnIndex - 1;
    return (
      <HistoryRow
        key={idx + 1}
        highlighted={currentTime}
        index={idx + 1}
        player={nextPlayer(fieldValueToPlayer(turn.turn))}
      />
    );
  });
  historyHtml.unshift(
    <HistoryRow key={0} highlighted={currentGame.nextTurnIndex === 0} index={0} player={FirstPlayer} />,
  );

  return (
    <section className="t-history-area">
      <h2>History</h2>
      <table className="t-history">
        <thead className="t-history-head">
          <tr>
            <th className="t-history-cell">Turn Number</th>
            <th className="t-history-cell">Player</th>
          </tr>
        </thead>
        <tbody>{historyHtml}</tbody>
      </table>
      <form className="t-row save-game-form">
        <div className="save-game-form-item">
          <label htmlFor="gameTitleInput">Title: </label>
          <input name="gameTitleInput" id="gameTitleInput" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <button className={'save-game-form-item t-btn' + (canSendSave ? '' : ' t-btn-disabled')} onClick={saveGame}>
          Save Game
        </button>
      </form>
    </section>
  );
}

interface HistoryRowProps {
  highlighted: boolean;
  index: number;
  player: PlayerT;
}

function HistoryRow({ highlighted, index, player }: HistoryRowProps) {
  const dispatch = useAppDispatch();
  const cssClass = highlighted ? 't-highlight' : '';
  return (
    <tr onClick={_ => dispatch(clickHistory(index))} className={cssClass}>
      <td className="t-history-cell">{index}</td>
      <td className="t-history-cell">{player}</td>
    </tr>
  );
}
