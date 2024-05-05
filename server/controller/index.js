const axios = require('axios');
const { insertGame, getAnswer } = require('../model');
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
  const gameID = 20 || req.body.gameID;
  const guess = [5,4,3,2,1] || req.body.guess;
  const username = req.body.username;
  const attempt = req.body.attempt;

  getAnswer(gameID)
    .then((result) => {
      const answer = result.rows[0].answer
      const guessResult = analyzeGuess(guess, answer);
      res.status(200).json(guessResult)
    })
    .catch((error) => {
      res.sendStatus(500);
      console.log('makeGame error: ', error);
    })

}

function getHint(req, res) {
  const gameID = req.body.gameID
  getAnswer(gameID)
    .then((result) => {
      const answer = result.rows[0].answer;
      const hint = createHint(answer);
      res.status(200).json({ hint })
    })
}

module.exports = { createGame, makeGuess, getHint }