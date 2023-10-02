import { useEffect } from 'react';
import { gameDeleteStart, gameFetchStart, gamesSelector } from '../features/games/gamesSlice';
import { useAppDispatch, useAppSelector } from '../reduxHooks';
import './GamesList.css';
import { currGameFetchStart, currentGameSelector, newGame } from '../features/currentGame/currentGameSlice';
import { ErrorBox } from './ErrorBox';

export function GamesList() {
  const gamesState = useAppSelector(gamesSelector);
  const currentGameState = useAppSelector(currentGameSelector);
  const dispatch = useAppDispatch();

  const currentGameId = currentGameState.value.type === 'existing' ? currentGameState.value.id : null;

  const gamesStatus = gamesState.state;
  useEffect(() => {
    if (gamesStatus === 'idle') {
      dispatch(gameFetchStart());
    }
  }, []);

  const currentlySelected = (id: number) => currentGameId && currentGameId === id;

  function fetchGame(id: number) {
    if (!currentlySelected(id)) {
      dispatch(currGameFetchStart(id));
    }
  }

  function deleteGame(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) {
    e.stopPropagation();
    dispatch(gameDeleteStart(id));
    if (currentlySelected(id)) {
      dispatch(newGame());
    }
  }

  let content;
  if (gamesStatus === 'loading') {
    content = <p>Loading...</p>;
  } else if (gamesStatus === 'deleting') {
    content = <p>Deleting...</p>;
  } else if (gamesStatus === 'error') {
    content = <ErrorBox errorMessage={gamesState.error} />;
  } else if (gamesStatus === 'success') {
    const games = gamesState.value.map(game => {
      const cssClass = currentlySelected(game.id) ? 't-highlight' : '';
      const updated = new Date(game.updatedAt);
      return (
        <tr key={game.id} onClick={() => fetchGame(game.id)} className={cssClass}>
          <td className="t-games-list-cell">{game.title}</td>
          <td className="t-games-list-cell">{`${updated.getFullYear()}-${
            updated.getMonth() + 1
          }-${updated.getDate()} ${updated.getHours()}:${updated.getMinutes()}`}</td>
          <td className="t-games-list-cell">
            <button onClick={e => deleteGame(e, game.id)} className="t-btn t-delete-btn">
              Delete
            </button>
          </td>
        </tr>
      );
    });
    content = (
      <table className="t-games-list">
        <thead className="t-games-list-head">
          <tr>
            <th className="t-games-list-cell">Title</th>
            <th className="t-games-list-cell">Updated</th>
            <th className="t-games-list-cell">Delete</th>
          </tr>
        </thead>
        <tbody>{games}</tbody>
      </table>
    );
  }

  return (
    <section className="t-games-list-area">
      <h2>Saved Games</h2>
      {content}
    </section>
  );
}
