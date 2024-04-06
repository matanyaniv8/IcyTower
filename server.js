const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log(`New player connected: ${socket.id}`);

    socket.on('playerMove', (data) => {
        // data could include player ID, new position, etc.
        console.log(`Move received from ${socket.id}:`, data);
        // Broadcast this move to all clients, including the sender
        io.emit('playerMoved', {id: socket.id, ...data});
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Notify other clients about the disconnection
        io.emit('playerDisconnected', socket.id);
    });

    socket.on('scoreUpdate', (data) => {
        io.emit('scoreUpdate', data);
    });
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});