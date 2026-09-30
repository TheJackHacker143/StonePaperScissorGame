import React, { useReducer } from 'react';
import axios from 'axios';

const TOTAL_ROUNDS = 6;
const CHOICES = ['stone', 'paper', 'scissors'];

const CHOICE_EMOJI = {
  stone: '✊',
  paper: '✋',
  scissors: '✌️'
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// this is the starting state of the whole game
const initialState = {
  step: 'names', // names -> playing -> result
  player1Name: '',
  player2Name: '',
  currentRound: 1,
  turn: 1, // 1 = player1 turn, 2 = player2 turn
  player1Choice: null,
  player1Score: 0,
  player2Score: 0,
  roundsHistory: [],
  saving: false,
  saveMessage: ''
};

// this function decides who wins the round, same logic as before
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

// reducer function, this handles all the state changes for the game
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER1_NAME':
      return { ...state, player1Name: action.payload };

    case 'SET_PLAYER2_NAME':
      return { ...state, player2Name: action.payload };

    case 'START_GAME':
      return { ...state, step: 'playing' };

    case 'PLAYER1_PICK':
      // player 1 picked, now wait for player 2 pick
      return { ...state, player1Choice: action.payload, turn: 2 };

    case 'PLAYER2_PICK': {
      // player 2 picked, ab round ka result nikalna hai
      const choice2 = action.payload;
      const winner = getRoundWinner(state.player1Choice, choice2);

      let newP1Score = state.player1Score;
      let newP2Score = state.player2Score;

      if (winner === 'player1') {
        newP1Score = state.player1Score + 1;
      } else if (winner === 'player2') {
        newP2Score = state.player2Score + 1;
      }

      const roundResult = {
        round: state.currentRound,
        player1Choice: state.player1Choice,
        player2Choice: choice2,
        winner: winner
      };

      const updatedHistory = [...state.roundsHistory, roundResult];

      // check agar last round tha to game khatam, warna next round
      if (state.currentRound === TOTAL_ROUNDS) {
        return {
          ...state,
          player1Score: newP1Score,
          player2Score: newP2Score,
          roundsHistory: updatedHistory,
          step: 'result'
        };
      }

      return {
        ...state,
        player1Score: newP1Score,
        player2Score: newP2Score,
        roundsHistory: updatedHistory,
        currentRound: state.currentRound + 1,
        turn: 1,
        player1Choice: null
      };
    }

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_SAVE_MESSAGE':
      return { ...state, saveMessage: action.payload };

    case 'PLAY_AGAIN':
      return initialState;

    default:
      return state;
  }
}

function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const {
    step,
    player1Name,
    player2Name,
    currentRound,
    turn,
    player1Choice,
    player1Score,
    player2Score,
    roundsHistory,
    saving,
    saveMessage
  } = state;

  function handleStartGame() {
    if (player1Name.trim() === '' || player2Name.trim() === '') {
      alert('Please enter both player names');
      return;
    }
    dispatch({ type: 'START_GAME' });
  }

  function handleChoiceClick(choice) {
    if (turn === 1) {
      dispatch({ type: 'PLAYER1_PICK', payload: choice });
    } else {
      dispatch({ type: 'PLAYER2_PICK', payload: choice });
    }
  }

  // jab game result screen pe pahuchta hai to data database me save karte hain
  // useReducer state update hone ke baad ye effect chalana tha, isliye simple
  // way me finishGame ko round complete hote hi call kar rahe hain neeche
  async function saveGameToDatabase(finalP1Score, finalP2Score, finalHistory) {
    let winnerName = '';
    if (finalP1Score > finalP2Score) {
      winnerName = player1Name;
    } else if (finalP2Score > finalP1Score) {
      winnerName = player2Name;
    } else {
      winnerName = 'Tie';
    }

    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      await axios.post(`${API_URL}/api/games`, {
        player1Name: player1Name,
        player2Name: player2Name,
        player1Score: finalP1Score,
        player2Score: finalP2Score,
        winnerName: winnerName,
        roundsData: finalHistory
      });
      dispatch({ type: 'SET_SAVE_MESSAGE', payload: 'Game saved successfully!' });
    } catch (err) {
      console.log(err);
      dispatch({ type: 'SET_SAVE_MESSAGE', payload: 'Could not save game to database.' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }

  // yaha check kar rahe hain ki game abhi abhi result step pe aaya hai ya nahi,
  // agar aaya hai aur data save nahi hua hai to save kar do
  if (step === 'result' && !saving && !saveMessage) {
    saveGameToDatabase(player1Score, player2Score, roundsHistory);
  }

  function handlePlayAgain() {
    dispatch({ type: 'PLAY_AGAIN' });
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
            onChange={(e) => dispatch({ type: 'SET_PLAYER1_NAME', payload: e.target.value })}
            placeholder="Enter name"
          />
        </div>
        <div className="form-group">
          <label>Player 2 Name: </label>
          <input
            type="text"
            value={player2Name}
            onChange={(e) => dispatch({ type: 'SET_PLAYER2_NAME', payload: e.target.value })}
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