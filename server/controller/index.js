const axios = require("axios");
const {
  insertGame,
  getAnswer,
  resolveGame,
  createHighScores,
  checkOpenGame,
  changeGameStatus,
} = require("../model");
const { analyzeGuess, createHint } = require("./helper");

function createGame(req, res) {
  const status = req.body.mode === "solo" ? "started" : "created";
  const genAnswerUrl = process.env.GEN_URL;
  const ansParams = {
    params: {
      num: req.body.difficulty,
      min: 0,
      max: 7,
      col: 1,
      base: 10,
      format: "plain",
      rnd: "new",
    },
  };
  axios
    .get(genAnswerUrl, ansParams)
    .then((answer) => {
      let answerStr = answer.data.split('\n')
      answerStr.pop();
      answerStr = answerStr.join('')
      return insertGame(
        req.body.mode,
        status,
        req.body.difficulty,
        answerStr,
        req.body.username
      )
    }
    )
    .then((gameID) => res.status(201).json({ gameID: gameID.rows[0].id }))
    .catch((error) => {
      res.sendStatus(500);
      console.log("insertGame error: ", error);
    });
}

function makeGuess(req, res) {
  const gameID = req.body.gameID;
  const guess = req.body.guess;
  const username = req.body.username;
  const attempts = req.body.attempts;
  const difficulty = req.body.difficulty;
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
  const gameID = req.body.gameID;
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
  const difficulty = req.body.difficulty;
  createHighScores(difficulty).then((highScores) =>
    res.status(200).json(highScores.rows)
  );
}

function openGame(req, res) {
  const gameID = req.body.gameID;
  const username = req.body.username;
  checkOpenGame(gameID)
    .then((result) => {
      if (result.rows[0] === undefined) {
        res.status(200).json({ gameStatus: "Game not found." });
      } else if (result.rows[0].status === "created") {
        changeGameStatus(username, gameID);
        res.status(201).json({ gameStatus: "Do your best!" });
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
