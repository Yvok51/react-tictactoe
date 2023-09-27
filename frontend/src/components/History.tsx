import { useAppDispatch } from '../reduxHooks';
import { clickHistory } from '../features/currentGame/currentGameSlice';
import { PlayerT, fieldValueToPlayer, nextPlayer } from './ticTacToeTypes';
import { Game } from './ticTacToeTypes';
import { FirstPlayer } from '../features/currentGame/constructField';
import './History.css';

interface TicTacToeHistoryProps {
  currentGame: Game;
}

export function History({ currentGame }: TicTacToeHistoryProps) {
  const historyHtml = currentGame.turns.map((turn, idx) => {
    const currentTime = idx == currentGame.nextTurnIndex - 1;
    return (
      <HistoryCell
        key={idx + 1}
        highlighted={currentTime}
        index={idx + 1}
        player={nextPlayer(fieldValueToPlayer(turn.turn))}
      />
    );
  });
  historyHtml.unshift(
    <HistoryCell key={0} highlighted={currentGame.nextTurnIndex === 0} index={0} player={FirstPlayer} />,
  );

  return (
    <section className="t-history-area">
      <table className="t-history">
        <thead className="t-history-head">
          <tr>
            <th className="t-history-cell">Turn Number</th>
            <th className="t-history-cell">Player</th>
          </tr>
        </thead>
        <tbody>{historyHtml}</tbody>
      </table>
    </section>
  );
}

interface HistoryCellProps {
  highlighted: boolean;
  index: number;
  player: PlayerT;
}

function HistoryCell({ highlighted, index, player }: HistoryCellProps) {
  const dispatch = useAppDispatch();
  const cssClass = highlighted ? 't-highlight' : '';
  return (
    <tr onClick={_ => dispatch(clickHistory(index))} className={cssClass}>
      <td className="t-history-cell">{index}</td>
      <td className="t-history-cell">{player}</td>
    </tr>
  );
}
