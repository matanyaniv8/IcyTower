#!/usr/bin/env node
/**
 * Node.js server for IcyTower Game.
 * @type {e | (() => Express)}
 */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const scoresFilePath = path.join(__dirname, 'scores.json');

app.use(express.static(__dirname));
app.use(bodyParser.json());
// Configure Keep-Alive
server.keepAliveTimeout = 30000; // Keep-alive timeout (30 seconds)
server.headersTimeout = 31000; // Headers timeout should be a little longer than keepAliveTimeout
server.maxHeadersCount = 1000; // Maximum number of headers


const readScores = (callback) => {
    fs.readFile(scoresFilePath, (err, data) => {
        if (err) {
            console.error('Error reading the scores file:', err);
            callback([]); // Return an empty array in case of file read error
            return;
        }
        if (!data || data.toString() === '') {
            console.log('Scores file is empty. Returning empty array.');
            callback([]); // Return an empty array if file is empty or has no content
            return;
        }
        try {
            const scores = JSON.parse(data.toString());
            callback(scores);
        } catch (parseError) {
            console.error('Error parsing JSON from scores file:', parseError);
            callback([]); // Return an empty array in case of JSON parse error
        }
    });
};

const writeScores = (scores, res) => {
    fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2), (err) => {
        if (err) {
            console.error('Error saving the score:', err);
            return res.status(500).send('Error saving the score');
        }
        console.log('Score saved successfully.');
        res.status(200).send('Score submitted successfully');
        // Emit an event with the updated leaderboard
        readScores((updatedScores) => {
            io.emit('leaderboardUpdated', updatedScores.slice(0, 10));
        });
    });
};

app.post('/submit-score', (req, res) => {
    const {nickname, score} = req.body;
    readScores((scores) => {
        const existingIndex = scores.findIndex(s => s.nickname === nickname);
        if (existingIndex > -1) {
            scores[existingIndex].score = Math.max(scores[existingIndex].score, score);
        } else {
            scores.push({nickname, score});
        }
        scores.sort((a, b) => b.score - a.score);
        writeScores(scores.slice(0, 10), res);
    });
});

app.get('/leaderboard', (req, res) => {
    readScores((scores) => {
        res.json(scores.slice(0, 10));
    });
});

/**
 * On new connection keeps track on the New Player id, moves, connection events and update his scores to the table.
 */
io.on('connection', (socket) => {
    console.log(`New player connected: ${socket.id}`);
    // future functionality
    socket.on('playerMove', (data) => {
        console.log(`Move received from ${socket.id}:`, data);
        io.emit('playerMoved', {id: socket.id, ...data});
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
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
