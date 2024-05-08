import React, { useState, useEffect } from "react";
import axios from "axios";
import GuessHistory from "./GuessHistory.jsx";
import HighScores from "./HighScores.jsx";
import CoderView from "./CoderView.jsx";
import { socket } from "../socket.jsx";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState(4);
  const [mode, setMode] = useState("");
  const [gameID, setGameID] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [combo, setCombo] = useState("");
  const [guessHistory, setGuessHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [highScores, setHighScores] = useState([]);
  const [hint, setHint] = useState({});
  const [endGame, setEndGame] = useState(false);
  const [room, setRoom] = useState("");
  const [openGameStatus, setOpenGameStatus] = useState("");
  const [socketMsg, setSocketMsg] = useState([]);
  const [role, setRole] = useState("");
  const [lastGuessResult, setLastGuessResult] = useState({});
  const [didLie, setDidLie] = useState(false);
  const [caughtLie, setCaughtLie] = useState(false);
  const [dropGame, setDropGame] = useState(false);
  const [showV1, setShowV1] = useState(true);
  const [showV2, setShowV2] = useState(false);
  const [showV3, setShowV3] = useState(true);
  const [showV4, setShowV4] = useState(true);
  const [showCoderView, setShowCoderView] = useState(false);
  const [pvp2InitView, setpvp2InitView] = useState(true);

  const resetAll = () => {
    setUsername("");
    setDifficulty(4);
    setMode("");
    setGameID(0);
    setAttempts(0);
    setCombo("");
    setGuessHistory([]);
    setHighScores([]);
    setHint({});
    setResults([]);
    setHighScores([]);
    setEndGame(false);
    setRoom("");
    setLastGuessResult({});
    setOpenGameStatus("");
    setDidLie(false);
    setCaughtLie(false);
    setDropGame(false);
    setShowV1(true);
    setShowV2(false);
    setShowV3(true);
    setShowV4(true);
    setSocketMsg([]);
    setRole("");
    setShowCoderView(false);
    setpvp2InitView(true);
  };
  const url = process.env.REACT_APP_URL || "http://localhost:3000/api";

  const createGame = () => {
    const game = { username, difficulty, mode };
    if (combo.length >= 4) game.combo = combo;

    axios
      .post(`${url}/createGame`, game)
      .then((r) => setGameID(r.data.gameID))
      .catch((e) => console.log(e));
  };

  const makeGuess = (combo, attempts) => {
    let guess = combo.split("").map((x) => Number(x));
    let tries = attempts + 1;
    setGuessHistory([...guessHistory, combo]);
    setAttempts(tries);
    axios
      .post(`${url}/makeGuess`, {
        gameID,
        guess,
        username,
        attempts: tries,
        difficulty,
      })
      .then((r) => {
        let guessResult = {
          guess: combo,
          loc: r.data.correctLoc,
          num: r.data.correctNum,
        };
        setResults([...results, guessResult]);
        if (r.data.endGame) setEndGame(true);
      })
      .catch((e) => console.log(e));
  };

  const getHighScores = (difficulty) => {
    axios
      .get(`${url}/getHighScores`, { params: { difficulty } })
      .then((r) => setHighScores(r.data))
      .catch((e) => console.log(e));
  };

  const getHint = (gameID) => {
    axios
      .get(`${url}/getHint`, { params: { gameID } })
      .then((r) => setHint(r.data.hint))
      .catch((e) => console.log(e));
  };

  const openGame = (gameID) => {
    axios
      .get(`${url}/openGame`, { params: { gameID, username } })
      .then((r) => {
        setDifficulty(r.data.difficulty);
        setOpenGameStatus(r.data.gameStatus);
      })
      .catch((e) => console.log(e));
  };

  const socketCreateGame = () => {
    const info = { room, username, difficulty, mode, combo };
    socket.connect();
    socket.emit("create-game", info);
  };

  const handleSocketCreateGame = (e) => {
    e.preventDefault();
    createGame(username, difficulty, mode);
    socketCreateGame();
    setShowV1(false);
    setShowCoderView(true);
    setpvp2InitView(false);
    setRole("coder");
  };

  const handleSocketJoinGame = (e) => {
    e.preventDefault();
    setpvp2InitView(false);
    socket.connect();
    setRole("decoder");
    socket.emit("join-room", { username, room });
  };

  const handleSocketMakeGuess = (e) => {
    e.preventDefault();
    const tries = attempts + 1;
    socket.emit("make-guess", {
      room,
      username,
      gameID,
      difficulty,
      attempts: tries,
      combo,
      role,
    });
    setAttempts(tries);
  };

  const tellLie = (e) => {
    e.preventDefault();
    const lieNum =
      lastGuessResult.correctNum > 0 ? lastGuessResult.correctNum - 1 : 0;
    const lieLoc =
      lastGuessResult.correctLoc > 0 ? lastGuessResult.correctLoc - 1 : 0;
    const lie = {
      combo: lastGuessResult.combo,
      correctLoc: lieLoc,
      correctNum: lieNum,
      room: room,
      username: username,
      didLie: true,
    };
    socket.emit("respond-guess", lie);
  };
  const tellTruth = (e) => {
    e.preventDefault();
    const info = { ...lastGuessResult, room, didLie: false };
    socket.emit("respond-guess", info);
  };

  const handleCallBluff = () => {
    if (didLie) {
      setEndGame(true);
      setCaughtLie(true);
      socket.emit("call-bluff", { room, endGame: true });
    }
  };

  useEffect(() => {
    socket.on("from-decoder", (info) => {
      let message = info.message;
      setSocketMsg([...socketMsg, message]);
      const packet = { room, username, gameID, difficulty };
      socket.emit("game-data", packet);
    });

    socket.on("start-game", (message) => {
      setGameID(message.gameID);
      openGame(message.gameID);
      setShowV1(false);
      setShowV4(false);
      setShowV2(true);
    });

    socket.on("make-guess", (info) => {
      setLastGuessResult(info);
      let message = `${info.username} guess ${info.combo}. ${info.correctNum} correct numbers, ${info.correctLoc} correct locations.`;
      setSocketMsg([...socketMsg, message]);
      setEndGame(info.endGame);
      setAttempts(info.attempts);
    });

    socket.on("respond-guess", (info) => {
      let newResult = {
        guess: info.combo,
        num: info.correctNum,
        loc: info.correctLoc,
      };
      setEndGame(info.endGame);
      setDidLie(info.didLie);
      setResults([...results, newResult]);
    });

    socket.on("call-bluff", (info) => {
      setEndGame(info.endGame);
      setCaughtLie(info.caughtLie);
    });

    socket.on("drop-game", (info) => {
      setEndGame(true);
      setDropGame(true);
    });

    return () => {
      socket.off("from-decoder");
      socket.off("start-game");
      socket.off("make-guess");
      socket.off("respond-guess");
      socket.off("call-bluff");
      socket.off("drop-game");
    };
  }, [room, username, gameID, role, difficulty, socketMsg, results]);

  return (
    <div>
      <h1>Ultimate Mastermind</h1>
      <button onClick={() => getHighScores(difficulty)}>
        Show High Scores
      </button>
      <HighScores highScores={highScores} />

      {showV1 ? (
        <div>
          <h3>Username:</h3>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="no space, case sensitive"
          ></input>
          {username.length > 0 ? (
            <h5 style={{ color: "green" }}>Username OK!</h5>
          ) : (
            <h5 style={{ color: "red" }}>Still need a username</h5>
          )}
          <br />

          <h3>Difficulty Level&#x28;4-6&#x29;:</h3>
          <h6>4 = normal&#x28;default&#x29; | 5 = veteran | 6 = nightmare</h6>
          <input
            onChange={(e) => setDifficulty(Number(e.target.value))}
            value={difficulty}
            placeholder="enter a number 4-6"
          ></input>
          {difficulty >= 4 && difficulty <= 6 ? (
            <h5 style={{ color: "green" }}>Difficulty OK!</h5>
          ) : (
            <h5>Please enter a number 4-6.</h5>
          )}
          <br />
          <h3>Game mode:</h3>
          <h6>
            solo = against PC | pvp1 = multiplayer&#x28;async&#x29; | pvp2 =
            multiplayer&#x28;real time&#x29;
          </h6>
          <input
            onChange={(e) => setMode(e.target.value)}
            value={mode}
            placeholder="solo, pvp1, or pvp2?"
          ></input>
          {mode === "solo" || mode === "pvp1" || mode === "pvp2" ? (
            <h5 style={{ color: "green" }}>Mode OK!</h5>
          ) : (
            <h5 style={{ color: "red" }}>Need valid mode input.</h5>
          )}
          {mode === "solo" && username && difficulty ? (
            <button
              onClick={() => {
                createGame();
                setShowV1(false);
              }}
            >
              Start!
            </button>
          ) : null}
        </div>
      ) : null}
      <br />

      {mode === "pvp1" && showV4 ? (
        <div>
          {showV3 ? (
            <div>
              <h3>CREATE a game to share</h3>
              <h5>Enter a {difficulty} numbers code, using numbers 0-7.</h5>
              <input
                onChange={(e) => setCombo(e.target.value)}
                value={combo}
                placeholder="enter your code"
              ></input>
              {combo.length === difficulty ? (
                <button
                  onClick={() => {
                    createGame(username, difficulty, mode);
                    setShowV1(false);
                  }}
                >
                  Create Game
                </button>
              ) : null}
              {gameID !== 0 ? (
                <h5 style={{ color: "green" }}>
                  Game Created! Give your friend this game ID: <b>{gameID}</b>{" "}
                </h5>
              ) : null}
            </div>
          ) : null}

          <br />
          <br />
          {combo.length ? null : (
            <div>
              <h3>JOIN a game</h3>
              <h5>Enter a game ID shared with you</h5>
              <input
                onChange={(e) => {
                  setGameID(e.target.value);
                  setShowV3(false);
                }}
                value={gameID}
                placeholder="example 23"
              ></input>
              <button
                onClick={() => {
                  openGame(gameID);
                  setShowV1(false);
                  setShowV2(true);
                  setShowV4(false);
                }}
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      ) : null}

      {(gameID !== 0 && mode === "solo") || (showV2 && mode !== "pvp2") ? (
        <div>
          <h5 style={{ color: "green" }}>{openGameStatus}</h5>
          <h3>Make a guess of {difficulty} numbers 0-7</h3>
          <input
            onChange={(e) => setCombo(e.target.value)}
            value={combo}
            placeholder="example 0123"
          ></input>
          {mode &&
          username &&
          combo.length === difficulty &&
          attempts < 10 &&
          !endGame ? (
            <button onClick={() => makeGuess(combo, attempts)}>
              Make Guess
            </button>
          ) : null}
          <p>attempts left: {10 - attempts}</p>
          <button onClick={() => getHint(gameID)}>Hint</button>
          {hint.total !== undefined ? (
            <p>
              First digit is: {hint.first}, Last digit is: {hint.last}, Total
              equals: {hint.total}
            </p>
          ) : null}

          <h3>Guess History</h3>
          <GuessHistory results={results} />
          {endGame && results[results.length - 1].loc === difficulty ? (
            <p style={{ color: "green" }}>
              All correct. YOU WIN! Reset Game to continue.
            </p>
          ) : null}
          {endGame && results[results.length - 1].loc !== difficulty ? (
            <p style={{ color: "red" }}>
              You ran out of attempts. Reset Game to continue.
            </p>
          ) : null}
        </div>
      ) : null}

      {mode === "pvp2" && pvp2InitView ? (
        <div>
          <h3>JOIN or CREATE a game in real time.</h3>
          {showV3 ? (
            <div>
              <h5>Enter a room name.</h5>
              <input
                onChange={(e) => setRoom(e.target.value)}
                value={room}
                placeholder="case sensitive. no spaces."
              ></input>
              <h5>Enter a {difficulty} numbers code, using numbers 0-7.</h5>
              <input
                onChange={(e) => setCombo(e.target.value)}
                value={combo}
                placeholder="enter your code. example 0123"
              ></input>
              {combo.length === difficulty ? (
                <button onClick={(e) => handleSocketCreateGame(e)}>
                  Create Game
                </button>
              ) : null}
            </div>
          ) : null}
          <br />
          <br />
          {combo.length ? null : (
            <div>
              <h5>Join a room to play against your friend.</h5>
              <input
                onChange={(e) => {
                  setRoom(e.target.value);
                  setShowV3(false);
                }}
                value={room}
                placeholder="enter room"
              ></input>
              <button
                onClick={(e) => {
                  handleSocketJoinGame(e);
                }}
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      ) : null}
      {gameID !== 0 && room && role === "coder" && !dropGame ? (
        <h5 style={{ color: "green" }}>
          Game Created! Invite a friend to join room: <b>{room}</b>{" "}
        </h5>
      ) : null}
      {gameID !== 0 && mode === "pvp2" && role === "decoder" && !dropGame ? (
        <div>
          <h5>THIS IS THE DECODER VIEW</h5>
          <h5 style={{ color: "green" }}>{openGameStatus}</h5>
          <h3>Make a guess of {difficulty} numbers 0-7</h3>
          <input
            onChange={(e) => setCombo(e.target.value)}
            value={combo}
            placeholder="example 0123"
          ></input>
          {mode &&
          username &&
          combo.length === difficulty &&
          attempts < 10 &&
          !endGame ? (
            <button onClick={(e) => handleSocketMakeGuess(e)}>
              Make Guess
            </button>
          ) : null}
          <p>attempts left: {10 - attempts}</p>
          <button onClick={() => getHint(gameID)}>Hint</button>
          {hint.total !== undefined ? (
            <p>
              First digit is {hint.first}, Last digit is {hint.last}, Total
              equals: {hint.total}
            </p>
          ) : null}

          <h3>Guess History</h3>
          <GuessHistory results={results} />
          {endGame && results[results.length - 1].loc === difficulty ? (
            <p style={{ color: "green" }}>All correct. YOU WON!</p>
          ) : null}
          {endGame && caughtLie ? (
            <p style={{ color: "green" }}>You caught the lie! YOU WIN!</p>
          ) : null}
          {endGame &&
          results[results.length - 1].loc !== difficulty &&
          !caughtLie ? (
            <p style={{ color: "red" }}>You ran out of attempts.</p>
          ) : null}
          <button onClick={(e) => handleCallBluff(e)}>Call Bluff!</button>
        </div>
      ) : null}

      {showCoderView && !dropGame ? (
        <div>
          <h5>Playing in {room}.</h5>
          <CoderView
            socketMsg={socketMsg}
            tellTruth={tellTruth}
            tellLie={tellLie}
            endGame={endGame}
          />
          <p>Player has {10 - attempts} left.</p>
          {endGame && lastGuessResult.correctLoc === difficulty ? (
            <p style={{ color: "red" }}>
              Your code was cracked! Tell Truth to let them know. Then Reset
              Game to continue.
            </p>
          ) : null}
          {endGame && caughtLie ? (
            <p style={{ color: "red" }}>You were caught lying! You loose.</p>
          ) : null}
          {endGame &&
          lastGuessResult.correctLoc !== difficulty &&
          !caughtLie ? (
            <p style={{ color: "green" }}>
              Player ran out of attempts. Tell Truth to let them know. YOU WIN!
            </p>
          ) : null}
        </div>
      ) : null}

      <br />
      {endGame && dropGame ? (
        <h3>Player has disconnected. Rest Game to continue.</h3>
      ) : null}
      <button onClick={() => resetAll()}>Reset Game</button>
    </div>
  );
}

export default App;
