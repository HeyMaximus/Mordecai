import React, { useState } from "react";
import axios from 'axios';
import GuessHistory from './GuessHistory.jsx';
import HighScores from './HighScores.jsx';
import { socket } from '../socket.jsx';

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
  const [room, setRoom] = useState('');
  const [openGameStatus, setOpenGameStatus] = useState('')

  //views
  const [showV1, setShowV1] = useState(true);
  const [showV2, setShowV2] = useState(false);
  const [showV3, setShowV3] = useState(true);
  const [showV4, setShowV4] = useState(true);

  const resetAll = () => {
    setUsername('');
    setDifficulty(4);
    setMode('');
    setGameID(0);
    setAttempts(0);
    setCombo('');
    setGuessHistory([]);
    setHighScores([]);
    setResults([]);
    setHighScores([]);
    setEndGame(false);

    setShowV1(true);
    setShowV2(false);
    setShowV3(true);
    setShowV4(true);
  }
  const url = 'http://localhost:3000/api';

  const createGame = () => {
    const game = {username, difficulty, mode};
    if (combo.length >=4) game.combo = combo;

    axios.post(`${url}/createGame`, game)
    .then((r) => setGameID(r.data.gameID))
    .catch((e) => console.log(e))
  }

  const makeGuess = (combo, attempts) => {
    let guess = combo.split('').map((x) => Number(x));
    let tries = attempts+1;
    setGuessHistory([...guessHistory, combo]);
    setAttempts(tries);
    axios.post(`${url}/makeGuess`, {gameID, guess, username, attempts: tries, difficulty})
      .then((r) => {
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

  const openGame = (gameID) => {
    axios.get(`${url}/openGame`, { params: { gameID, username } })
    .then((r) => {
      console.log(r.data.gameStatus);
      setDifficulty(r.data.difficulty);
      setOpenGameStatus(r.data.gameStatus);
    })
    .catch((e) => console.log(e))
  }

  const testSocket = () => {
    const info = {room, username, difficulty, mode, combo}
    socket.connect();
    socket.emit('create-game', info)
  }

  return (
    <div>
      <h1>Ultimate Mastermind</h1>
      <button onClick={() => getHighScores(difficulty)}>Show High Scores</button>
      <HighScores highScores={highScores} />
      <button onClick={() => testSocket()}>Test socket</button>

    {showV1 ?
    <div>
      <h3>Enter name:</h3>
      <input onChange={(e) => setUsername(e.target.value)} value={username} placeholder="no space, case sensitive"></input>
      {username.length > 0 ? <h5 style={{ color: 'green' }}>Username OK!</h5> : <h5 style={{ color: 'red' }}>Still need a username</h5>}
      <br/>

      <h3>Enter difficulty &#x28;4-6&#x29;:</h3>
      <input onChange={(e) => setDifficulty(Number(e.target.value))} value={difficulty} placeholder="enter a number 4-6"></input>
      {difficulty >= 4 && difficulty <=6 ? <h5 style={{ color: 'green' }} >Difficulty OK!</h5> : <h5>Please enter a number 4-6.</h5>}
      <br/>
      <h3>Enter game mode:</h3>
      <input onChange={(e) => setMode(e.target.value)} value={mode} placeholder="solo, pvp1, or pvp2?"></input>
      {mode === 'solo' || mode ==='pvp1' || mode === 'pvp2' ? <h5 style={{ color: 'green' }}>Mode OK!</h5> : <h5>Need valid mode input.</h5>}
      {mode === 'solo' && username && difficulty ? <button onClick={() => {createGame(); setShowV1(false);}}>Start!</button> : null}
      </div> : null}
      <br/>

      {mode === 'pvp1' && showV4 ?
      <div>
      <h3>JOIN or CREATE a game to share.</h3>
      {showV3 ?
      <div>
      <h5>Enter a {difficulty} numbers code, using numbers 0-7.</h5>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="enter your code"></input>
      {combo.length === difficulty ? <button onClick={() => {createGame(username, difficulty, mode); setShowV1(false);}}>Create Game</button> : null}
      {gameID !== 0 ? <h5 style={{ color: 'green' }}>Game Created! Give your friend this game ID: <b>{gameID}</b> </h5>: null }
      </div>
      :null}

      <br/>
      <br/>
      {combo.length ? null : <div>
      <h5>Enter a game ID to play against your friend.</h5>
      <input onChange={(e) => {setGameID(e.target.value); setShowV3(false);}} value={gameID} placeholder="example 23"></input>
      <button onClick={() => {openGame(gameID); setShowV1(false); setShowV2(true); setShowV4(false);}}>Join Game</button>
        </div>}
      </div>
      : null}

      {gameID !== 0 && mode === 'solo' || showV2 ?
      <div>
      <h5 style={{ color: 'green' }}>{openGameStatus}</h5>
      <h3>Make a guess of {difficulty} numbers 0-7</h3>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="example 0123"></input>
      {mode && username && combo.length === difficulty && attempts < 10 && endGame ? <button onClick={() => makeGuess(combo, attempts)}>Make Guess</button> : null}
      <p>attempts left: {10-attempts}</p>
      <button onClick={() => getHint(gameID)}>Hint</button>
      {hint.total !== undefined ? <p>First digit is: {hint.first}, Last digit is: {hint.last}, Total equals: {hint.total}</p> : null}

      <h3>Guess History</h3>
      <GuessHistory results={results} endGame={endGame} difficulty={difficulty}/>
      {endGame && results[results.length-1].loc === difficulty ? <p style={{ color: 'green' }}>All correct. YOU WON!</p> : null}
      {endGame && results[results.length-1].loc !== difficulty ? <p style={{ color: 'red' }}>You ran out of attempt.</p> : null}
      </div>
      :null
      }


{mode === 'pvp2'?
      <div>
      <h3>Join or Create a game.</h3>
      <p>Enter a {difficulty} numbers combination, using numbers 0-7.</p>
      <input onChange={(e) => setCombo(e.target.value)} value={combo} placeholder="example 0123"></input>
      <button onClick={() => createGame(username, difficulty, mode)}>Create Game</button>
      {gameID !== 0 ? <p>Game Created!{gameID} </p>: null }

      <p>Enter a game ID to play against your friend.</p>
      <input onChange={(e) => setGameID(e.target.value)} value={gameID} placeholder="example 23"></input>
      <button onClick={() => openGame(gameID)}>Join Game</button>
      </div>
      : null}

<button onClick={() => resetAll()}>Reset Game</button>
    </div>
  );
}

export default App;
