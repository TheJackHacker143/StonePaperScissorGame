-- database and table for stone paper scissors game

CREATE DATABASE IF NOT EXISTS sps_game;

USE sps_game;

CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player1_name VARCHAR(50) NOT NULL,
  player2_name VARCHAR(50) NOT NULL,
  player1_score INT NOT NULL,
  player2_score INT NOT NULL,
  winner_name VARCHAR(50) NOT NULL,
  rounds_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
