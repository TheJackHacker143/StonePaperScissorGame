import React, { useState } from 'react';
import axios from 'axios';

const TOTAL_ROUNDS = 6;
const CHOICES = ['stone', 'paper', 'scissors'];

const CHOICE_EMOJI = {
  stone: '✊',
  paper: '✋',
  scissors: '✌️'
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function GamePage() {
  // step tells us which screen to show - names, playing, or result
  const [step, setStep] = useState('names');

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const [currentRound, setCurrentRound] = useState(1);
  const [turn, setTurn] = useState(1); // 1 = player1 turn, 2 = player2 turn
  const [player1Choice, setPlayer1Choice] = useState(null);

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const [roundsHistory, setRoundsHistory] = useState([]);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // this function decides who wins the round
  function getRoundWinner(choice1, choice2) {
    if (choice1 === choice2) {
      return 'tie';
    }
    if (
      (choice1 === 'stone' && choice2 === 'scissors') ||
      (choice1 === 'scissors' && choice2 === 'paper') ||
      (choice1 === 'paper' && choice2 === 'stone')
    ) {
      return 'player1';
    }
    return 'player2';
  }

  function handleStartGame() {
    if (player1Name.trim() === '' || player2Name.trim() === '') {
      alert('Please enter both player names');
      return;
    }
    setStep('playing');
  }

  function handleChoiceClick(choice) {
    if (turn === 1) {
      // player 1 selected, now save it and wait for player 2 turn
      setPlayer1Choice(choice);
      setTurn(2);
    } else {
      // player 2 selected, now we can calculate the round result
      const choice2 = choice;
      const winner = getRoundWinner(player1Choice, choice2);

      let newP1Score = player1Score;
      let newP2Score = player2Score;

      if (winner === 'player1') {
        newP1Score = player1Score + 1;
        setPlayer1Score(newP1Score);
      } else if (winner === 'player2') {
        newP2Score = player2Score + 1;
        setPlayer2Score(newP2Score);
      }

      const roundResult = {
        round: currentRound,
        player1Choice: player1Choice,
        player2Choice: choice2,
        winner: winner
      };

      const updatedHistory = [...roundsHistory, roundResult];
      setRoundsHistory(updatedHistory);

      // check if this was the last round
      if (currentRound === TOTAL_ROUNDS) {
        finishGame(newP1Score, newP2Score, updatedHistory);
      } else {
        setCurrentRound(currentRound + 1);
        setTurn(1);
        setPlayer1Choice(null);
      }
    }
  }

  async function finishGame(finalP1Score, finalP2Score, finalHistory) {
    setStep('result');

    let winnerName = '';
    if (finalP1Score > finalP2Score) {
      winnerName = player1Name;
    } else if (finalP2Score > finalP1Score) {
      winnerName = player2Name;
    } else {
      winnerName = 'Tie';
    }

    // saving game data to backend/database
    try {
      setSaving(true);
      await axios.post(`${API_URL}/api/games`, {
        player1Name: player1Name,
        player2Name: player2Name,
        player1Score: finalP1Score,
        player2Score: finalP2Score,
        winnerName: winnerName,
        roundsData: finalHistory
      });
      setSaveMessage('Game saved successfully!');
    } catch (err) {
      console.log(err);
      setSaveMessage('Could not save game to database.');
    } finally {
      setSaving(false);
    }
  }

  function handlePlayAgain() {
    setStep('names');
    setPlayer1Name('');
    setPlayer2Name('');
    setCurrentRound(1);
    setTurn(1);
    setPlayer1Choice(null);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setRoundsHistory([]);
    setSaveMessage('');
  }

  // ---------------- screen 1: enter names ----------------
  if (step === 'names') {
    return (
      <div className="container">
        <h3>Enter Player Names</h3>
        <div className="form-group">
          <label>Player 1 Name: </label>
          <input
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <div className="form-group">
          <label>Player 2 Name: </label>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <button className="btn" onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    );
  }

  // ---------------- screen 2: playing rounds ----------------
  if (step === 'playing') {
    const activePlayerName = turn === 1 ? player1Name : player2Name;

    return (
      <div className="container">
        <h3>Round {currentRound} of {TOTAL_ROUNDS}</h3>
        <p className="score-line">
          {player1Name}: {player1Score} &nbsp; | &nbsp; {player2Name}: {player2Score}
        </p>

        <h4>{activePlayerName}'s turn, please select your choice</h4>
        <p className="small-note">
          (Other player please look away so choice stays hidden!)
        </p>

        <div className="choice-buttons">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              className="btn choice-btn"
              data-emoji={CHOICE_EMOJI[choice]}
              onClick={() => handleChoiceClick(choice)}
            >
              {choice}
            </button>
          ))}
        </div>

        {/* showing past rounds result below */}
        {roundsHistory.length > 0 && (
          <div className="history-box">
            <h4>Rounds so far:</h4>
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>{player1Name}</th>
                  <th>{player2Name}</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {roundsHistory.map((r) => (
                  <tr key={r.round}>
                    <td>{r.round}</td>
                    <td>{r.player1Choice}</td>
                    <td>{r.player2Choice}</td>
                    <td>
                      {r.winner === 'tie'
                        ? 'Tie'
                        : r.winner === 'player1'
                        ? player1Name
                        : player2Name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ---------------- screen 3: final result ----------------
  if (step === 'result') {
    let winnerText = '';
    if (player1Score > player2Score) {
      winnerText = `${player1Name} wins the game!`;
    } else if (player2Score > player1Score) {
      winnerText = `${player2Name} wins the game!`;
    } else {
      winnerText = "It's a Tie!";
    }

    return (
      <div className="container">
        <h2>Game Over</h2>
        <h3>{winnerText}</h3>
        <p className="score-line">
          Final Score - {player1Name}: {player1Score} | {player2Name}: {player2Score}
        </p>

        <div className="history-box">
          <h4>All Rounds:</h4>
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>{player1Name}</th>
                <th>{player2Name}</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {roundsHistory.map((r) => (
                <tr key={r.round}>
                  <td>{r.round}</td>
                  <td>{r.player1Choice}</td>
                  <td>{r.player2Choice}</td>
                  <td>
                    {r.winner === 'tie'
                      ? 'Tie'
                      : r.winner === 'player1'
                      ? player1Name
                      : player2Name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {saving && <p>Saving game data...</p>}
        {saveMessage && <p>{saveMessage}</p>}

        <button className="btn" onClick={handlePlayAgain}>
          Play Again
        </button>
      </div>
    );
  }

  return null;
}

export default GamePage;