const db = require("../db");

let pool = null;
db.then((res) => {
  pool = res;
}).catch((error) => console.log("Database Pool error: ", error));

function insertGame(mode, status, difficulty, answer, username) {
  const queryStr = `INSERT INTO games (mode, status, difficulty, answer, username)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id;`;
  return pool.query(queryStr, [mode, status, difficulty, answer, username]);
}

function getAnswer(gameID) {
  const queryStr = "SELECT answer FROM games WHERE id=$1";
  return pool.query(queryStr, [gameID]);
}

function resolveGame(status, solved, attempts, username, gameID) {
  const queryStr = `UPDATE games SET status=$1, solved=$2, attempts=$3, username=$4 WHERE id=$5;`;
  return pool.query(queryStr, [status, solved, attempts, username, gameID]);
}

function createHighScores(difficulty) {
  const queryStr = `SELECT username, attempts FROM games
  WHERE difficulty=$1 AND mode='solo' AND solved='t' AND status='completed'
  ORDER BY attempts DESC
  LIMIT 5;`;
  return pool.query(queryStr, [difficulty]);
}

function checkOpenGame(gameID) {
  const queryStr = `SELECT status FROM games WHERE mode='pvp1' AND status='created' AND id=$1;`;
  return pool.query(queryStr, [gameID]);
}

function changeGameStatus(username, gameID) {
  const queryStr = `UPDATE games SET status='started', username=$1 WHERE id=$2;`;
  return pool.query(queryStr, [username, gameID]);
}

module.exports = {
  insertGame,
  getAnswer,
  resolveGame,
  createHighScores,
  checkOpenGame,
  changeGameStatus,
};
