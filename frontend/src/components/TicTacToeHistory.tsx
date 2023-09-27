import { useAppDispatch } from '../reduxHooks';
import { clickHistory } from '../features/currentGame/currentGameSlice';
import { PlayerT, fieldValueToPlayer, nextPlayer } from './ticTacToeTypes';
import { Game } from './ticTacToeTypes';
import { FirstPlayer } from '../features/currentGame/constructField';

interface TicTacToeHistoryProps {
  currentGame: Game;
}

export function TicTacToeHistory({ currentGame }: TicTacToeHistoryProps) {
  const historyHtml = currentGame.turns.map((turn, idx) => {
    const currentTime = idx == currentGame.nextTurnIndex - 1;
    return <HistoryCell highlighted={currentTime} index={idx + 1} player={nextPlayer(fieldValueToPlayer(turn.turn))} />;
  });
  historyHtml.unshift(<HistoryCell highlighted={currentGame.nextTurnIndex === 0} index={0} player={FirstPlayer} />);

  return (
    <section className="t-history-area">
      <table className="t-history">
        <thead className="t-history-head">
          <td className="t-history-cell">Turn Number</td>
          <td className="t-history-cell">Player</td>
        </thead>
        {historyHtml}
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
  const cssClass = highlighted ? 't-history-highlight' : '';
  return (
    <tr key={index} onClick={_ => dispatch(clickHistory(index))} className={cssClass}>
      <td className="t-history-cell">{index}</td>
      <td className="t-history-cell">{player}</td>
    </tr>
  );
}
