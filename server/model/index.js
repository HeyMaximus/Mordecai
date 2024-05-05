const db = require('../db');

let pool = null;
db.then((res) => {pool = res})
.catch((error) => console.log('Database Pool error: ', error))

function insertGame(mode, difficulty, answer, username) {
  const queryStr = `INSERT INTO games (mode, status, difficulty, answer, username)
  VALUES ($1, 'started', $2, '$3', '$4')
  RETURNING id;`

  // const queryStr = `INSERT INTO games (mode, status, difficulty, answer, username)
  // VALUES ('solo', 'started', 6, '54321', 'Kevin')
  // RETURNING id;`
return pool.query(queryStr, [mode, difficulty, answer, username]);
}

function getAnswer(gameID) {
  const queryStr = 'SELECT answer FROM games WHERE id=$1';
  return pool.query(queryStr, [gameID])
}

function resolveGame(status, solved, attempts, gameID) {
  const queryStr = `UPDATE games SET status=$1, solved=$2, attempts=$3 WHERE id=$3;`;
  return pool.query(queryStr, [status, solved, gameID])
}

function createHighScores(difficulty) {
  const queryStr = `SELECT username, attempts FROM games
  WHERE difficulty=$1 AND solved='t' AND status='completed'
  ORDER BY attempts DESC
  LIMIT 5;`
  return pool.query(queryStr, [difficulty])
}

module.exports = { insertGame, getAnswer, resolveGame, createHighScores }