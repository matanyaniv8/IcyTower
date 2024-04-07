let otherPlayers = {};

socket.on('connect', () => {
    console.log('Connected to the multiplayer server as ' + socket.id);
});

// Receive the initial game state (e.g., platforms) from the server
socket.on('gameState', (data) => {
    // Assuming your game has a function or a way to initialize/update platforms
    socket.emit('gameState', {platforms});

    if (data.platforms) {
        updatePlatforms(data.platforms); // You need to implement this in your game logic
    }
});

// Example function to send player's movement to the server
function reportPlayerMove(x, y, velX, velY) {
    socket.emit('playerMove', {x, y, velX, velY});
}

// Example listener for other players' movements
socket.on('playerMoved', (data) => {
    // Assuming you have a way to update other players' positions in your game
    updateOtherPlayerPosition(data.id, data.x, data.y, data.velX, data.velY); // Implement this
});

// Handle player disconnection
socket.on('playerDisconnected', (playerId) => {
    // Assuming you have a way to remove a player from the game
    removeOtherPlayer(playerId); // Implement this
});

// Function to update platforms based on server data
function updatePlatforms(platformsData) {
    // Clear existing platforms
    platforms = [];
    platformId = 0; // Reset platformId if you're using it to uniquely identify platforms

    // Add new platforms based on platformsData received from the server
    platformsData.forEach(platform => {
        platforms.push({
            id: platformId++,
            x: platform.x,
            y: platform.y,
            width: platform.width,
            height: platform.height,
            // Add other properties as necessary, based on your game's logic
        });
    });

    // You might need to re-draw your game scene here if it doesn't automatically do so
}


// Update other player position
function updateOtherPlayerPosition(id, x, y, velX, velY) {
    // This function would need to find the other player in your game's state and update their position
    // If your game doesn't already support multiple player entities, you'll need to add this functionality
}

// Remove a player who has disconnected
function removeOtherPlayer(playerId) {
    delete otherPlayers[playerId];
}
