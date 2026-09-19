import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function HistoryPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/games`);
      setGames(response.data);
    } catch (err) {
      console.log(err);
      setError('Could not load games from server');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="container"><p>Loading games...</p></div>;
  }

  if (error) {
    return <div className="container"><p>{error}</p></div>;
  }

  return (
    <div className="container">
      <h3>All Games Played</h3>

      {games.length === 0 && <p>No games played yet.</p>}

      {games.map((game) => (
        <div className="game-card" key={game.id}>
          <p>
            <b>{game.player1_name}</b> ({game.player1_score}) vs{' '}
            <b>{game.player2_name}</b> ({game.player2_score})
          </p>
          <p>Winner: {game.winner_name}</p>
          <p className="date-text">
            Played on: {new Date(game.created_at).toLocaleString()}
          </p>

          <details>
            <summary>Show round details</summary>
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>{game.player1_name}</th>
                  <th>{game.player2_name}</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {game.rounds_data.map((r) => (
                  <tr key={r.round}>
                    <td>{r.round}</td>
                    <td>{r.player1Choice}</td>
                    <td>{r.player2Choice}</td>
                    <td>
                      {r.winner === 'tie'
                        ? 'Tie'
                        : r.winner === 'player1'
                        ? game.player1_name
                        : game.player2_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      ))}
    </div>
  );
}

export default HistoryPage;
