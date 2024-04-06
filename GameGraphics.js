// Images
const backgroundImage = new Image();
const greyPlatformImage = new Image()
const redPlatformImage = new Image();
const playerImage = new Image();
const movingEnemyImage = new Image();
const constantEnemyImage = new Image();
const starPowerupImage = new Image();
starPowerupImage.src = './res/star.png'; // Update the path to your star powerup image
backgroundImage.src = './res/Background/Blue.png'; // Set the source after defining the onload handler
playerImage.src = './res/player.png'; // Update the path to your player image
greyPlatformImage.src = './res/greyPlatform.png';
redPlatformImage.src = './res/redPlatform.png';
movingEnemyImage.src = './res/pig.png';
constantEnemyImage.src = './res/bomb.png';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function draw() {
    // Drawing logic
    drawBackground();
    drawPlayer();
    drawPlatforms();
    drawPowerups();
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText("Score: " + score, 10, 30);
}

/**
 * Draw background image into canvas
 */
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

/**
 * Draw player with a given image.
 */
function drawPlayer() {
    let currentTime = Date.now();
    if (currentTime < invincibilityEndTime) {
        // Player is invincible; reduce opacity
        ctx.globalAlpha = 0.5;
    } else {
        // Player is not invincible; full opacity
        ctx.globalAlpha = 1.0;
        player.inPowerUpMode = false;
    }

    let playerHeightToAdd = canvas.height - player.y === player.height ? 10 : 0;

    // Calculate the new size based on the scale factor
    const drawWidth = player.width * playerImageScale;
    const drawHeight = player.height * playerImageScale;

    // Adjust the draw position so that the player's logical and visual positions align
    const drawX = player.x - (drawWidth - player.width) / 2;
    const drawY = player.y - (drawHeight - player.height) / 2;

    // Draw the player image with the new size and adjusted position
    ctx.drawImage(playerImage, drawX, drawY - playerHeightToAdd, drawWidth, drawHeight);
}

function drawPowerups() {
    platforms.forEach(platform => {
        if (platform.hasPowerup && !player.inPowerUpMode) {
            if (!platform.powerup.collected) {
                // Assuming the powerup's position is at the center of the platform
                const powerupX = platform.x + (platform.width / 2) - 10; // Adjust X to place it in the middle of the platform
                const powerupY = platform.y - 20; // Adjust Y so the powerup appears above the platform
                ctx.drawImage(starPowerupImage, powerupX, powerupY, 20, 20); // Adjust size as needed
            }
        }
    });
}

/**
 * Draw platforms according to their type.
 * Platforms with enemies on them will be colored red and will be wider.
 * Platforms without an enemy on them would be gray and less wide.
 */
function drawPlatforms() {
    let platformImage = null;
    platforms.forEach(platform => {
        platformImage = (platform.enemy) ? redPlatformImage : greyPlatformImage
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width + 5, platform.height + 10);
        // Check if platform ID is divisible by 10 (and not the first platform)
        if (platform.id % 10 === 0 && platform.id !== 0) {
            ctx.fillStyle = 'white'; // Text color
            ctx.font = '12px Arial'; // Font size and family
            // Calculate text position to center it on the platform
            let text = platform.id.toString();
            let textWidth = ctx.measureText(text).width;
            let textX = platform.x + (platform.width - textWidth) / 3;
            let textY = platform.y + (platform.height / 2) + 6; // Adjust to center text vertically
            ctx.fillText(text, textX, textY);
        }
        // Drawing Enemies
        if (platform.enemy) {
            let isTypeOne = platform.enemy.type === 'Type1'
            let enemyImage = isTypeOne ? constantEnemyImage : movingEnemyImage;
            let enemyX = platform.x + platform.enemy.x; // Calculate absolute position
            let enemyY = platform.y - platform.enemy.height;

            // New dimensions
            const drawWidth = isTypeOne ? platform.enemy.width * enemyScaleFactor * enemyScaleFactor : platform.enemy.width * enemyScaleFactor;
            const drawHeight = isTypeOne ? platform.enemy.height * enemyScaleFactor * enemyScaleFactor : platform.enemy.height * enemyScaleFactor;

            // Adjust position to keep the enemy centered
            const drawX = enemyX - (drawWidth - platform.enemy.width * enemyScaleFactor) / 2;
            const drawY = isTypeOne ? enemyY - (drawHeight - platform.enemy.height * 1.5) : enemyY - (drawHeight - platform.enemy.height);

            // Draw the enemy image with new size
            ctx.drawImage(enemyImage, drawX, drawY, drawWidth * 1.3, drawHeight * 1.3);
        }
    });
}