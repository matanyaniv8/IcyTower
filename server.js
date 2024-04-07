const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const scoresFilePath = path.join(__dirname, 'scores.json');

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.post('/submit-score', (req, res) => {
    const { nickname, score } = req.body;

    // Read the existing scores file
    fs.readFile(scoresFilePath, (err, data) => {
        let scores = [];
        if (!err) {
            scores = JSON.parse(data.toString());
        }

        // Add or update the score
        const existingIndex = scores.findIndex(s => s.nickname === nickname);
        if (existingIndex > -1) {
            scores[existingIndex].score = Math.max(scores[existingIndex].score, score);
        } else {
            scores.push({ nickname, score });
        }

        // Write the updated scores back to the file
        fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2), (err) => {
            if (err) {
                console.error('Error saving the score:', err);
                return res.status(500).send('Error saving the score');
            }
            console.log('Score saved successfully.');
            res.status(200).send('Score submitted successfully');
        });
    });
});

app.get('/leaderboard', (req, res) => {
    fs.readFile(scoresFilePath, (err, data) => {
        if (err) {
            console.error('Error reading the scores file:', err);
            return res.status(500).send('Error reading the leaderboard');
        }

        const scores = JSON.parse(data.toString());
        scores.sort((a, b) => b.score - a.score); // Sort by score in descending order

        res.json(scores.slice(0, 10)); // Send top 10 scores
    });
});

function saveScoreToFile(nickname, score) {
    // Read existing scores from file
    fs.readFile(scoresFilePath, (err, data) => {
        let scores = [];
        if (!err) {
            scores = JSON.parse(data.toString());
        }

        // Add the new score
        scores.push({ nickname, score });

        // Write the updated scores back to the file
        fs.writeFile(scoresFilePath, JSON.stringify(scores), (err) => {
            if (err) throw err;
            console.log('Score saved to file successfully.');
        });
    });
}

/**
 * On new connection keeps track on the New Player id, moves, connection events and update his scores to the table.
 */
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