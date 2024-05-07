const io = require("socket.io")({ cors: '*' });

io.on("connection", socket => {
  console.log('THIS IS SOCKET.ID: ', socket.id)
  socket.on('create-game', (packet)=> {
    console.log('this is recieved: ', packet)
    socket.join(packet.room)
  })
});

const url = process.env.SOCKET_PORT || 3010;
io.listen(url);

module.exports = io;