const router = require('express').Router();
const { createGame, makeGuess } = require('./controller')
//require controllers

router.post('/createGame', createGame);
router.post('/makeGuess', makeGuess);

module.exports = router;