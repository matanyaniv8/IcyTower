/**
 * The game loop logic file, and Socket's communication.
 */
// Key Listener
let keys = [];
const socket = io(); // Assuming you're serving your game from the same host as your server
// Use this token as a unique identifier for the user in your application
const userToken = getUserToken();
let lastPlatfromLandedId = 0 ;

// Future functionality
function reportPlayerMove() {
    if (!player) return;
    // Example of sending player position and velocity
    socket.emit('playerMove', {x: player.x, y: player.y, velX: player.velX, velY: player.velY});
}

// Listen for other players' movements
socket.on('playerMoved', (data) => {
    console.log(`Player ${data.id} moved to ${data.x}, ${data.y}`);
    // You might want to update the positions of other players here
    // This requires maintaining a list or object of player instances on the client side
});

socket.on('playerDisconnected', (playerId) => {
    console.log(`Player ${playerId} disconnected`);

    // Handle removing the player's character from the game
});
socket.on('leaderboardUpdated', (scores) => {
    fetchAndDisplayLeaderboard();
});
startGame();

// Keys listener
window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
    if (e.keyCode === 32 && !player.jumping) {
        player.jumping = true;
        player.velY = baseJump;
    }
});
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
});

// Touch capabilities
window.addEventListener('touchstart', handleTouchStart, false);
window.addEventListener('touchmove', handleTouchMove, false);
window.addEventListener('touchend', handleTouchEnd, false);


let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchEnd(evt){
    // Reset horizontal movement keys
    keys[37] = false; // Reset left arrow key status
    keys[39] = false; // Reset right arrow key status
    player.velX = 0
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;
    let moveFactor = 2
    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // Horizontal movement
        if (xDiff > 0) {
            // Left swipe
            keys[37] = true;
            player.velX += player.speed * -moveFactor; // Move left
        } else {
            // Right swipe
            keys[39] = true;
            player.velX += moveFactor * player.speed; // Move right
        }
    } else {
        // Vertical movement
        if (yDiff > 0) {
            // Up swipe, initiate jump
            if (!player.jumping) {
                player.jumping = true;
                player.velY = baseJump * 1.5;

                // Apply horizontal movement during the jump based on the direction of the swipe
                if (xDiff > 0) {
                    // Jumping left
                    player.velX += player.speed * -moveFactor;
                } else if (xDiff < 0) {
                    // Jumping right
                    player.velX += moveFactor * player.speed;
                }
            }
        }
        // Down swipe not handled, as it wasn't defined in the original setup
    }

    // Reset touch coordinates
    xDown = null;
    yDown = null;
}
/**
 * The main loop of the game.
 * where the magic happens.
 */
function updateGame() {
    // Background
    draw();
    makePlatformsMove();
    updatePowerUpMode();

    // At the beginning of your game update loop, check if it's game over
    if (isGameOver()) {
        // Stop the game loop or handle game over
        saveScore(promptForNickname(), score);
        document.getElementById('gameOverContainer').style.display = 'block';
        fetchAndDisplayLeaderboard();
        return; // Stops the animation loop
    }

    // Player movement logic
    if (keys[39]) { // Right arrow key
        if (player.velX < player.speed) {
            player.velX++;
            //player.velX += player.speed;
        }
    }
    if (keys[37]) { // Left arrow key
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;
    player.velY += gravity;
    player.x += player.velX;
    player.y += player.velY;

    // Screen scroll logic
    if (player.y < canvas.height / 4) {
        let deltaY = Math.abs(player.velY);
        player.y += deltaY;
        platforms.forEach(platform => {
            platform.y += deltaY;
            platform.originalY += deltaY
        });
    }

    // Reset standing time for all platforms
    platforms.forEach(platform => platform.standingTime > 0 && platform.standingTime++);

    // Assume no platform is being stood on at the start of each frame
    let standingOnPlatform = false;
    platforms.forEach(platform => {
        // Collision with the platform
        if (player.x < platform.x + platform.width && player.x + player.width > platform.x &&
            player.y < platform.y && player.y + player.height > platform.y && player.velY >= 0) {

            // Player lands on platform logic
            player.jumping = false;
            player.velY = 0;
            player.y = platform.y - player.height;
            standingOnPlatform = true; // Player is standing on a platform this frame

            // Mark platform as landed for scoring
            if (!landedPlatforms.has(platform.id)) {
                score += platform.id - lastPlatfromLandedId;
                lastPlatfromLandedId = platform.id
                // Once the player gets up with scores,
                // increase the moving enemies speed for a more challenging game.
                enemySpeed = enemySpeed < 2 ? enemySpeed + epsilon : enemySpeed;
                landedPlatforms.add(platform.id);
            }

            // Increment standingTime since player is standing on this platform
            if (platform.standingTime === 0) {
                platform.standingTime = 1; // Start counting from 1
            } else {
                platform.standingTime++; // Increment each frame player stands on the platform
            }
        }

        // Make the platform fall if standingTime exceeds 3 seconds (180 frames at 60fps)
        if (platform.standingTime > 180) {
            let goingDownSpeed = 1;

            for (let gap = platform.y; gap >= 0; gap--) {
                player.y += goingDownSpeed * platformFallingRate;
                platform.y += goingDownSpeed * platformFallingRate; // Make the platform fall
                goingDownSpeed += 0.5;
            }
        }
    });

    // Reset standingTime for platforms the player is not standing on anymore
    platforms.forEach(platform => {
        if (!standingOnPlatform && platform.standingTime > 0) {
            platform.standingTime = 0; // Reset if player is no longer on the platform
        }
    });

    // It might be useful to clean up platforms that have fallen out of view to keep the game performant.
    platforms = platforms.filter(platform => platform.y < canvas.height + 100);

    // Reset standingTime for platforms the player is not standing on anymore
    platforms.forEach(platform => {
        if (!standingOnPlatform && platform.standingTime > 0) {
            platform.standingTime = 0; // Reset if player is no longer on the platform
        }
    });

    // Edge collision logic
    if (player.x >= canvas.width - player.width) player.x = canvas.width - player.width;
    else if (player.x <= 0) player.x = 0;

    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.velY = 0;
    }

    // Check if a new platform is needed
    generateNewPlatformsIfNeeded();
    makeEnemyType2ToMove();
    // draw at the end of every iteration
    draw();

    requestAnimationFrame(updateGame);
}

document.getElementById('playAgainButton').addEventListener('click', startGame);
