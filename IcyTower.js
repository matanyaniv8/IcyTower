// Game settings
const gravity = 0.4;
const friction = 0.9;
const defaultBaseJump = -10;
const powerUpJumpBase = 1.25 * defaultBaseJump;
// Drawing setting for player printing
const playerImageScale = 2.5;
const enemyScaleFactor = 1.5; // Example: Increase size by 50%
const enemyDimension = 15;
const upDownMovementThreshold = 50
const platformFallingRate = 0.0001;
// Game Variables
let baseJump = defaultBaseJump;
let player = null
let platforms = [];
let platformId = 0;
let enemySpeed = 1; // Adjust this value to find a suitable speed
let epsilon = 0.05;
let invincibilityEndTime = 0; // track invincibility duration
let score = 0;
let landedPlatforms = new Set(); // Track IDs of platforms the player has landed on

// Key Listener
let keys = [];
startGame();
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

function generateNewPlatformsIfNeeded() {
    // Assuming the game scrolls vertically and new platforms should appear at the top
    const viewportTop = Math.min(...platforms.map(p => p.y));
    const newPlatformThreshold = -100; // New platforms appear above this line

    if (viewportTop > newPlatformThreshold) {
        // Add a new platform above the current highest platform
        let newYPosition = viewportTop - 100; // Adjust based on desired spacing
        addNewPlatformAt(newYPosition);
    }
/*    // power up TODO: review
    let platform = platforms[platforms.length - 1]; // Get the last platform added
    if (platform.hasPowerup) {
        platform.powerup = {
            type: 'star',
            collected: false
        };
    }*/
}

function addNewPlatformAt(yPosition) {
    let hasEnemy = Math.random() < 0.05;
    let platformWidth = hasEnemy ? 150 : 100;
    let isMovingPlatform = Math.random() < 0.06; // Ensure moving platforms can be generated anytime
    let movingDirection = isMovingPlatform ? (Math.random() < 0.5 ? 1 : -1) : 0;
    let hasPowerUp = Math.random() < 0.01; // 5% chance to spawn a powerup on a new platform

    platforms.push({
        id: platformId++,
        x: Math.random() * (canvas.width - platformWidth),
        y: yPosition,
        width: platformWidth,
        height: 10,
        standingTime: 0,
        isMoving: isMovingPlatform, // Apply moving logic consistently
        movingDirection: movingDirection,
        originalY: yPosition,
        hasPowerup : hasPowerUp,
        powerup : hasPowerUp ? {
            type: 'star',
            collected: false} : null,
        enemy: hasEnemy ? {
            type: Math.random() < 0.5 ? 'Type1' : 'Type2',
            x: Math.random() * (platformWidth - 20),
            movingDirection: Math.random() < 0.5 ? -1 : 1,
            width: enemyDimension,
            height: enemyDimension
        } : null
    });
}

/**
 * Initialize the gae player and platforms.
 */
function initPlatformsAndPlayer() {
    player = {
        x: canvas.width / 2,
        y: canvas.height - 150,
        width: 25,
        height: 25,
        speed: 5,
        velX: 0,
        velY: 0,
        jumping: false,
        inPowerUpMode : false
    };
    // Initialize 10 platforms at the beginning
    for (let i = 0; i < 10; i++) {
        let hasEnemy = Math.random() < 0.05 || i === 5; // Ensure platform 5 has an enemy for testing
        let isMovingPlatform = Math.random() < 0.06; // 6% chance for a platform to be moving
        let movingDirection = isMovingPlatform ? (Math.random() < 0.5 ? 1 : -1) : 0; // Direction 1: down, -1: up for moving platforms

        // A platform with an enemy should be wider
        let platformWidth = hasEnemy ? 150 : 100;
        let platformY = canvas.height - (100 * i) - 50; // Calculate Y based on iteration to spread them vertically

        platforms.push({
            id: platformId++,
            x: Math.random() * (canvas.width - platformWidth), // Random X position
            y: platformY,
            width: platformWidth,
            height: 10,
            standingTime: 0,
            isMoving: isMovingPlatform,
            movingDirection: movingDirection,
            originalY: platformY, // Set originalY for moving platforms
            enemy: hasEnemy ? {
                type: Math.random() < 0.5 ? 'Type1' : 'Type2',
                x: Math.random() * (platformWidth - 20), // Ensure the enemy is within the platform
                movingDirection: Math.random() < 0.5 ? -1 : 1, // Randomize an initial direction for Type2
                width: enemyDimension,
                height: enemyDimension
            } : null
        });
    }
}


function makePlatformsMove() {
    platforms.forEach(platform => {
        if (platform.standingTime >= 180) {
            platform.isMoving = false;
        } else {
            // validates that no platform would move lower than "ground"/canvas's height.
            platform.isMoving = platform.isMoving && platform.originalY + upDownMovementThreshold < canvas.height;
            if (platform.isMoving) {
                platform.y += platform.movingDirection; // Adjust speed as needed
                // Reverse the direction when the platform moves a defined threshold pixels from its original position
                if (platform.y < platform.originalY - upDownMovementThreshold || platform.y > platform.originalY + upDownMovementThreshold) {
                    platform.movingDirection *= -1;
                }
            }
        }
    });
}


/**
 * Checks if the game is over - if the player has fall to the bottom of the screen,
 *  Or the player has collided with an enemy.
 */
function isGameOver() {
    let gameOver = player.y + player.height >= canvas.height && score !== 0;
/*    let currentTime = Date.now();
        if (!gameOver && currentTime < invincibilityEndTime) {
            return false; // Player cannot die while invincible
        }*/
    if (!gameOver && !player.inPowerUpMode) {
        platforms.forEach(platform => {
            if (platform.enemy) {
                let enemyX = platform.x + platform.enemy.x;
                let enemyY = platform.y - platform.enemy.height; // Assuming the enemy is on top of the platform

                // Check for collision with the enemy
                if (player.x < enemyX + platform.enemy.width &&
                    player.x + player.width > enemyX &&
                    player.y < enemyY + platform.enemy.height &&
                    player.y + player.height > enemyY) {
                    gameOver = true; // Set the game over state to true
                }
            }
        });
    }
    return gameOver
}

function startGame() {
    platforms = [];
    platformId = 1;
    score = 0;
    landedPlatforms.clear()
    initPlatformsAndPlayer();
    // Hide the game over container
    document.getElementById('gameOverContainer').style.display = 'none';
    window.requestAnimationFrame(updateGame);
}

function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push(score);
    scores.sort((a, b) => b - a);
    scores.splice(10); // Keep only top 10 scores
    localStorage.setItem('scores', JSON.stringify(scores));
}

function getTopScores() {
    return JSON.parse(localStorage.getItem('scores')) || [];
}

function updateLeaderboard() {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = ''; // Clear current list
    const topScores = getTopScores();
    topScores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score;
        scoresList.appendChild(li);
    });
}

function makeEnemyType2ToMove() {
    platforms.forEach(platform => {
        if (platform.enemy && platform.enemy.type === 'Type2') {
            // Adjust speed or direction based on game logic
            platform.enemy.x += platform.enemy.movingDirection * enemySpeed; // Movement speed
            if (platform.enemy.x <= 0) {
                platform.enemy.x = 0; // Prevent moving beyond the left edge
                platform.enemy.movingDirection *= -1; // Change direction
            } else if (platform.enemy.x + platform.enemy.width >= platform.width) {
                platform.enemy.x = platform.width - platform.enemy.width; // Prevent moving beyond the right edge
                platform.enemy.movingDirection *= -1; // Change direction
            }
        }
    });
}

function updateGame() {
    // Background
    draw();
    makePlatformsMove();
    // At the beginning of your game update loop, check if it's game over
    if (isGameOver()) {
        // Stop the game loop or handle game over
        saveScore(score); // Assuming 'score' is your current game score
        updateLeaderboard();
        document.getElementById('gameOverContainer').style.display = 'block';
        return; // Stops the animation loop
    }
    // if player in power mode increase his base jump height.
    baseJump = player.inPowerUpMode ? powerUpJumpBase : defaultBaseJump;

        platforms.forEach(platform => {
            if (platform.hasPowerup){
                if (platform.powerup && !platform.powerup.collected && player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y && player.y + player.height > platform.y) {
                    platform.powerup.collected = true;
                    player.inPowerUpMode = true;
                    invincibilityEndTime = Date.now() + 8000; // 8 seconds of invincibility
                }
            }
        });

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
                score++;
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

   draw();

    requestAnimationFrame(updateGame);
}

document.getElementById('playAgainButton').addEventListener('click', startGame);
