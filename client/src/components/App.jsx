import React, { useState } from "react";
import axios from 'axios';

import GuessHistory from './GuessHistory.jsx'
import HighScores from './HighScores.jsx'

function App() {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState(4);
  const [mode, setMode] = useState("");
  const [gameID, setGameID] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [combo, setCombo] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [results, setResults] = useState([])
  const [highScores, setHighScores] = useState([]);
  const [hint, setHint] = useState({});
  const [endGame, setEndGame] = useState(false);

  const resetAll = () => {
    setUsername('');
    setDifficulty(4);
    setMode('');
    setGameID(0);
    setAttempts('');
    setCombo('');
    setGuessHistory([]);
    setHighScores([]);
    setResults([]);
    setHighScores([]);
    setEndGame(false);
  }
  const url = 'http://localhost:3000/api';

  const createGame = () => {
    const game = {username, difficulty, mode};
    if (combo.length >=4) game.combo = combo;

    axios.post(`${url}/createGame`, game)
    .then((r) => setGameID(r.data.gameID))
    .catch((e) => console.log(e))
  }

  const makeGuess = () => {
    let guess = combo.split('').map((x) => Number(x));
    let tries = attempts+1;
    setGuessHistory([...guessHistory, combo]);
    setAttempts(tries);
    axios.post(`${url}/makeGuess`, {gameID, guess, username, attempts: tries, difficulty})
      .then((r) => {
        console.log(r.data)
        let guessResult = {
            guess: combo,
            loc: r.data.correctLoc,
            num: r.data.correctNum
      };
      setResults([...results, guessResult]);
      if (r.data.endGame) setEndGame(true);
      }
      )
      .catch((e)=> console.log(e))
  }

  const getHighScores = (difficulty) => {
    axios.get(`${url}/getHighScores`, { params: { difficulty } })
    .then((r) => setHighScores(r.data))
    .catch((e) => console.log(e))
  }

  const getHint = (gameID) => {
    axios.get(`${url}/getHint`, { params: { gameID } })
    .then((r) => setHint(r.data.hint))
    .catch((e) => console.log(e))
  }

  return (
    <div>
      <h1>Ultimate Mastermind</h1>
      <button onClick={() => resetAll()}>Reset Game</button>

      <button onClick={() => getHighScores(difficulty)}>High Scores</button>
      <HighScores highScores={highScores} />

      <h3>Enter name?</h3>
      <div><input onChange={(e) => setUsername(e.target.value)} value={username} placeholder="no space, case sensitive"></input>
      {username.length > 0 ? <h4>Username OK!</h4> : <h4>Still need a username</h4>}
      </div>

      <h3>Enter difficulty. 4-6</h3>
      <input onChange={(e) => setDifficulty(Number(e.target.value))} value={difficulty} placeholder="enter a number 4-6"></input>
      {difficulty >= 4 && difficulty <=6 ? <h4>Difficulty OK!</h4> : <h4>Still need a number 4-6.</h4>}

      <h3>Enter game mode. solo, pvp1</h3>
      <input onChange={(e) => setMode(e.target.value)} value={mode} placeholder="solo, pvp1, or pvp2?"></input>
      {mode === 'solo' || mode ==='pvp1' || mode === 'pvp2' ? <h4>Mode OK!</h4> : <h4>Need valid mode input.</h4>}
      {mode === 'solo' ? <button onClick={() => createGame()}>Start!</button> : null}

      {mode === 'pvp1'?
      <div>
      <h3>Join or Create a game to share.</h3>
      <p>Enter a {difficulty} numbers combination, using numbers 0-7.</p>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="example 0123"></input>
      <button onClick={() => createGame(username, difficulty, mode)}>Create Game</button>
      {gameID !== 0 ? <p>Give your friend this game ID: {gameID} </p>: null }

      <p>Enter a game ID to play against your friend.</p>
      <input onChange={(e) => setGameID(e.target.value)} value={gameID} placeholder="example 23"></input>
      <button onClick={() => createGame()}>Join Game</button>
      </div>
      : null}

      {gameID !== 0 && mode === 'solo' ?
      <div>
      <h3>Make a guess of {difficulty} numbers 0-7</h3>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="example 0123"></input>
      {mode && username && combo.length === difficulty && attempts < 10 ? <button onClick={() => makeGuess()}>Make Guess</button> : null}
      <p>attempts left: {10-attempts}</p>
      <button onClick={() => getHint(gameID)}>Hint</button>
      {hint.total !== undefined ? <p>First digit is: {hint.first}, Last digit is: {hint.last}, Total equals: {hint.total}</p> : null}

      <h3>Guess History</h3>
      <GuessHistory results={results} endGame={endGame} difficulty={difficulty}/>
      {endGame && results[results.length-1].loc === difficulty ? <p>All correct. YOU WON!</p> : null}
      {endGame && results[results.length-1].loc !== difficulty ? <p>You ran out of attempts</p> : null}
      </div>
      :null
      }

    </div>
  );
}

export default App;
