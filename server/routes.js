const router = require('express').Router();
const { createGame, makeGuess, getHint } = require('./controller')
//require controllers

router.post('/createGame', createGame);
router.post('/makeGuess', makeGuess);
router.get('/getHint', getHint);

module.exports = router;