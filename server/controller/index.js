const axios = require('axios');
const { insertGame, getAnswer, resolveGame, createHighScores } = require('../model');
const { analyzeGuess, createHint } = require('./helper')

function createGame(req, res) {
  const genAnswerUrl = process.env.GEN_URL;
  const ansParams = {
    params: {
      num: 7,
      min: 0,
      max: 7,
      col: 1,
      base: 10,
      format: 'plain',
      rnd: 'new',
    }
  };
  axios.get(genAnswerUrl, ansParams)
    .then((answer) => insertGame(req.body.mode, req.body.difficulty, answer.data, req.body.username))
    .then((gameID) => res.status(201).json({gameID: gameID.rows[0].id}))
    .catch((error) => {
      res.sendStatus(500);
      console.log('insertGame error: ', error);
    });
}

function makeGuess(req, res) {
  const gameID = req.body.gameID || 5;
  const guess = req.body.guess || [5,4,3,2,1];
  const username = req.body.username;
  const attempts = req.body.attempts || 7;
  const difficulty = req.body.difficulty || 5;
  let endGame = false;

  getAnswer(gameID)
    .then((result) => analyzeGuess(guess, result.rows[0].answer))
    .then((guessResult) => {
      if (attempts === 10 && guessResult.correctLoc !== difficulty) {
          endGame = true;
          resolveGame('completed', false, attempts, gameID);
      } else if (attempts <= 10 && guessResult.correctLoc === difficulty) {
          endGame = true;
          resolveGame('completed', true, attempts, gameID);
      }
        res.status(200).json({...guessResult, endGame})
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log('makeGame error: ', error);
    })
}

function getHint(req, res) {
  const gameID = req.body.gameID || 6;
  getAnswer(gameID)
    .then((result) => {
      const answer = result.rows[0].answer;
      const hint = createHint(answer);
      res.status(200).json({ hint })
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log('getHint error: ', error);
    })
}

function getHighScores (req, res) {
  const difficulty = req.body.difficulty || 6;
  createHighScores(difficulty)
    .then((highScores) => res.status(200).json(highScores.rows))

}

module.exports = { createGame, makeGuess, getHint, getHighScores }