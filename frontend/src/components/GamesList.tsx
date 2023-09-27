import './GamesList.css';

export function GamesList() {
  return (
    <section className="t-games-list-area">
      <table className="t-games-list">
        <thead className="t-games-list-head">
          <tr>
            <th className="t-games-list-cell">Title</th>
            <th className="t-games-list-cell">Updated</th>
            <th className="t-games-list-cell">Delete</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  );
}
