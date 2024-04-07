/**
 * The IcyTower Initializer and manager.
 * The Main methods are being held here.
 */
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

function generateNewPlatformsIfNeeded() {
    // Assuming the game scrolls vertically and new platforms should appear at the top
    const viewportTop = Math.min(...platforms.map(p => p.y));
    const newPlatformThreshold = -100; // New platforms appear above this line

    if (viewportTop > newPlatformThreshold) {
        // Add a new platform above the current highest platform
        let newYPosition = viewportTop - 100; // Adjust based on desired spacing
        addNewPlatformAt(newYPosition);
    }
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
        hasPowerup: hasPowerUp,
        powerup: hasPowerUp ? {
            type: 'star',
            collected: false
        } : null,
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
        inPowerUpMode: false
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

function updatePowerUpMode() {
    // if the player is in power mode, increase his base jump height.
    baseJump = player.inPowerUpMode ? powerUpJumpBase : defaultBaseJump;

    platforms.forEach(platform => {
        if (platform.hasPowerup) {
            if (platform.powerup && !platform.powerup.collected && player.x < platform.x + platform.width && player.x + player.width > platform.x && player.y < platform.y && player.y + player.height > platform.y) {
                platform.powerup.collected = true;
                player.inPowerUpMode = true;
                invincibilityEndTime = Date.now() + 8000; // 8 seconds of invincibility
            }
        }
    });
}