import React, { useState, useEffect, createContext } from "react";
import axios from 'axios';

import GuessHistory from './GuessHistory.jsx'

function App() {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState(4);
  const [mode, setMode] = useState("");
  const [gameID, setGameID] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [combo, setCombo] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [results, setResults] = useState([])
  const [highScores, setHighScores] = useState([]);

  const resetAll = () => {
    setUsername('');
    setDifficulty(4);
    setMode('');
    setgameID(0);
    setAttempt('');
    setGuess('');
    setGuessHistory([]);
    setHighScores([]);
  }
  const url = 'http://localhost:3000/api';

  const createGame = () => {
    axios.post(`${url}/createGame`, {username, difficulty, mode})
    .then((r) => setGameID(r.data.gameID))
    .catch((e) => console.log(e))
  }

  const makeGuess = () => {
    let guess = combo.split('').map((x) => Number(x));
    let tries = attempt+1;
    setGuessHistory([...guessHistory, combo])
    setAttempt(tries)
    axios.post(`${url}/makeGuess`, {gameID, guess, username, attempt, difficulty})
      .then((r) => {
        console.log(r.data)
        let guessResult = {
            guess: combo,
            loc: r.data.correctLoc,
            num: r.data.correctNum
      }
      setResults([...results, guessResult])
      }
      )
      .catch((e)=> console.log(e))
  }

  return (
    <div>
      <h1>Ultimate Mastermind</h1>

      <h3>What is your name?</h3>
      <div><input onChange={(e) => setUsername(e.target.value)} value={username} placeholder="username, no spaces"></input>
      {username.length > 0 ? <h4>Username OK!</h4> : <h4>Still need a username</h4>}
      </div>

      <h3>Select difficulty. 4-6</h3>
      <input onChange={(e) => setDifficulty(e.target.value)} value={difficulty} placeholder="enter a number 4-6"></input>
      {difficulty >= 4 && difficulty <=6 ? <h4>Difficulty OK!</h4> : <h4>Valid difficulty is a number 4-6.</h4>}

      <h3>Select game mode. solo, pvp1</h3>
      <input onChange={(e) => setMode(e.target.value)} value={mode} placeholder="solo or pvp1? case sensitive."></input>
      {mode === 'solo' || mode ==='pvp1' ? <h4>Mode OK!</h4> : <h4>Need valid mode input.</h4>}
      <button onClick={() => createGame()}>Start Game</button>

      <h3>Make a guess of {difficulty} numbers 0-7</h3>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="example 0123"></input>
      {mode && username && combo.length === difficulty && attempt < 10 ? <button onClick={() => makeGuess()}>Make Guess</button> : null}
      <p>attempts left: {10-attempt}</p>
      <h3>Guess History</h3>
      <GuessHistory results={results}/>

    </div>
  );
}

export default App;
