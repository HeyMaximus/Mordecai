const router = require('express').Router();
const { createGame, makeGuess, getHint, getHighScores } = require('./controller');

router.post('/createGame', createGame);
router.post('/makeGuess', makeGuess);
router.get('/getHint', getHint);
router.get('/getHighScores', getHighScores)

module.exports = router;