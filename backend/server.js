// main server file for stone paper scissors game
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// simple check route to see if server is running
app.get('/', (req, res) => {
  res.send('Stone Paper Scissors backend is running');
});

// this route saves the finished game data into database
app.post('/api/games', async (req, res) => {
  try {
    const { player1Name, player2Name, player1Score, player2Score, winnerName, roundsData } = req.body;

    // basic validation, agar name empty hai to error bhejenge
    if (!player1Name || !player2Name) {
      return res.status(400).json({ message: 'Player names are required' });
    }

    const sql = `INSERT INTO games (player1_name, player2_name, player1_score, player2_score, winner_name, rounds_data) VALUES (?, ?, ?, ?, ?, ?)`;

    const roundsJson = JSON.stringify(roundsData);

    const [result] = await db.query(sql, [
      player1Name,
      player2Name,
      player1Score,
      player2Score,
      winnerName,
      roundsJson
    ]);

    res.status(201).json({ message: 'Game saved successfully', gameId: result.insertId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong while saving game' });
  }
});

// this route gives all the past games to show on history page
app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games ORDER BY created_at DESC');

    // rounds_data column stored as text(json string), converting back to array
    const games = rows.map((game) => {
      return {
        ...game,
        rounds_data: JSON.parse(game.rounds_data)
      };
    });

    res.status(200).json(games);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong while fetching games' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
