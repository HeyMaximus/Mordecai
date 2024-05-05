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
  const queryStr = 'SELECT answer FROM games WHERE id = $1';
  return pool.query(queryStr, [gameID])
}


module.exports = { insertGame, getAnswer }