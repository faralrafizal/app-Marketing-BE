var socket_io = require('socket.io')
var io = socket_io();
var socketApi = {};
const controller = require('../controller')
socketApi.io = io;

io.on('connection', function (socket) {

  socket.on('join-room', (roomName) => {
    socket.join(roomName); // Bergabung dengan grup
  });

  socket.on('chat message', (message) => {
    console.log(`Received message: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
})

module.exports = socketApi;
