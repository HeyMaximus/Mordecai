const io = require("socket.io")({
  cors: {
    origin: true,
    credentials: true
  },
});
const { instrument } = require("@socket.io/admin-ui");
const { analyzeGuess } = require('./controller/helper.js');
const { getAnswer, resolveGame } = require('./model');

io.on("connection", (socket) => {
  socket.on("create-game", (info) => {
    socket.join(info.room);
  });

  socket.on("join-room", (info) => {
    socket.join(info.room);
    socket.to(info.room).emit("from-decoder", {message: `A player joined. You are now playing with ${info.username}`});
  });

  socket.on("game-data", (info) => {
    socket.to(info.room).emit("start-game", info);
  });

  socket.on("make-guess", (info) => {
    let endGame = false;
    let guess = info.combo.split('').map((x) => Number(x));
    getAnswer(info.gameID)
    .then((result) => analyzeGuess(guess, result.rows[0].answer))
    .then((result) => {
      if (info.attempts === 10 && result.correctLoc !== info.difficulty) {
        endGame = true;
        resolveGame("completed", false, info.attempts, info.username, info.gameID);
      } else if (info.attempts <= 10 && result.correctLoc === info.difficulty) {
        endGame = true;
        resolveGame("completed", true, info.attempts, info.username, info.gameID);
      }
      socket.to(info.room).emit('make-guess', {...result, combo: info.combo, username: info.username, endGame, attempts: info.attempts});
    })
    .catch((error)=> console.log(error))
  });

  socket.on("respond-guess", (info) => {
    socket.to(info.room).emit('respond-guess', info)
  });

  socket.on("call-bluff", (info) => {
    socket.to(info.room).emit('call-bluff', {endGame: true, caughtLie: true});
  })

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("drop-game", { endGame: true, dropGame: true });
    })
  });
});

instrument(io, {
  auth: false,
});

const port = process.env.SOCKET_PORT || 3010;
io.listen(port);
console.log(`Socket.io listening on PORT: ${port}.`);

module.exports = io;
