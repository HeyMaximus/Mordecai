const io = require("socket.io")({
  cors: {
    origin: true,
    credentials: true
  },
});
const { instrument } = require("@socket.io/admin-ui");
const {
  createGame,
  makeGuess,
  getHint,
  getHighScores,
  openGame,
} = require("./controller");

io.on("connection", (socket) => {
  console.log("A SOCKET.ID CONNECTED: ", socket.id);
  socket.on("create-game", (info) => {
    console.log("this is recieved: ", info);
    socket.join(info.room);
  });

  socket.on("join-room", (info) => {
    console.log('JOIN ROOM triggered, room is: ', info.room)
    socket.join(info.room);
    socket.to(info.room).emit("from-decoder", {message: `DeCoder joined. You are now playing with ${info.username}`});
  });

  socket.on("game-data", (info) => {
    console.log('game data triggered: ', info)
    socket.to(info.room).emit("start-game", info);
  });

  socket.on("make-guess", () => {});

  socket.on("respond-guess", () => {});

  socket.on("disconnect", () => {
    console.log("this socket disccoected: ", socket.id);
    let room = socket.room;
    socket.to(room).emit("drop-game", { endGame: true });
  });
});

instrument(io, {
  auth: false,
});

const url = process.env.SOCKET_PORT || 3010;
io.listen(url);

module.exports = io;
