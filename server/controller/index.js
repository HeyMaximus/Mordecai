const axios = require('axios');
const { insertGame, getAnswer } = require('../model');
const { analyzeGuess } = require('./helper')

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
      res.status(500);
      console.log('insertGame error: ', error);
    });
}

function makeGuess(req, res) {
  const gameID = 20;
  const guess = [0,4,7,1,1] || req.body.guess;
  const username = req.body.username;
  const attempt = req.body.attempt;

  getAnswer(gameID)
    .then((result) => {
      const answer = result.rows[0].answer
      console.log('this is answer: ', answer);
      console.log('this is guess: ', guess);
      const guessResult = analyzeGuess(guess, answer);
      console.log('this is guess result: ', guessResult)
    })

}

module.exports = { createGame, makeGuess }