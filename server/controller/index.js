const {
  insertGame,
  getAnswer,
  resolveGame,
  createHighScores,
  checkOpenGame,
  changeGameStatus,
} = require("../model");
const { genAnswer, analyzeGuess, createHint } = require("./helper");

async function createGame(req, res) {
  try {
    const status = req.body.mode === "solo" ? "started" : "created";
    const answer =
      req.body.combo !== undefined
        ? req.body.combo
        : await genAnswer(req.body.difficulty);
    const gameID = await insertGame(
      req.body.mode,
      status,
      req.body.difficulty,
      answer,
      req.body.username
    );
    res.status(201).json({ gameID: gameID.rows[0].id });
  } catch (error) {
    res.sendStatus(500);
    console.log("insertGame error: ", error);
  }
}

function makeGuess(req, res) {
  const { gameID, guess, username, attempts, difficulty } = req.body;
  let endGame = false;

  getAnswer(gameID)
    .then((result) => analyzeGuess(guess, result.rows[0].answer))
    .then((guessResult) => {
      if (attempts === 10 && guessResult.correctLoc !== difficulty) {
        endGame = true;
        resolveGame("completed", false, attempts, username, gameID);
      } else if (attempts <= 10 && guessResult.correctLoc === difficulty) {
        endGame = true;
        resolveGame("completed", true, attempts, username, gameID);
      }
      res.status(200).json({ ...guessResult, endGame });
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("makeGame error: ", error);
    });
}

function getHint(req, res) {
  const gameID = req.query.gameID;
  getAnswer(gameID)
    .then((result) => {
      const answer = result.rows[0].answer;
      const hint = createHint(answer);
      res.status(200).json({ hint });
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("getHint error: ", error);
    });
}

function getHighScores(req, res) {
  const difficulty = req.query.difficulty;
  createHighScores(difficulty)
    .then((highScores) => res.status(200).json(highScores.rows))
    .catch((error) => {
      res.sendStatus(500);
      console.log("genHighScore error: ", error);
    });
}

function openGame(req, res) {
  const gameID = req.query.gameID;
  const username = req.query.username;

  checkOpenGame(gameID)
    .then((result) => {
      if (result.rows[0] === undefined) {
        res.status(200).json({ gameStatus: "Game not found." });
      } else if (result.rows[0].status === "created") {
        changeGameStatus(username, gameID);
        res
          .status(201)
          .json({
            gameStatus: "Do your best!",
            difficulty: result.rows[0].difficulty,
          });
      } else {
        res.status(200).json({ gameStatus: "Game already used." });
      }
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log("openGame error: ", error);
    });
}

module.exports = { createGame, makeGuess, getHint, getHighScores, openGame };
