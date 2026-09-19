import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GamePage from './GamePage';
import HistoryPage from './HistoryPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar">
          <h2>Stone Paper Scissors</h2>
          <div className="nav-links">
            <Link to="/">Play Game</Link>
            <Link to="/history">All Games</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
