const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Constants
const PADDLE_WIDTH = 15, PADDLE_HEIGHT = 100;
const BALL_SIZE = 25;
const PLAYER_X = 10, AI_X = canvas.width - PADDLE_WIDTH - 10;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;
const WIN_SCORE = 10;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = playerY;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
let playerScore = 0, aiScore = 0;
let gameRunning = false;
let gameOver = false;

// Elements
const rulesOverlay = document.getElementById("rulesOverlay");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameMessage = document.getElementById("gameMessage");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");

// Start game handler
startBtn.addEventListener("click", () => {
    rulesOverlay.style.display = "none";
    resetGame();
    gameRunning = true;
    gameOver = false;
    restartBtn.style.display = "none";
    gameMessage.style.display = "none";
    gameLoop();
});

// Restart game handler
restartBtn.addEventListener("click", () => {
    resetGame();
    gameRunning = true;
    gameOver = false;
    restartBtn.style.display = "none";
    gameMessage.style.display = "none";
    gameLoop();
});

// Mouse paddle control
canvas.addEventListener("mousemove", (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
});

// Touch paddle control for mobile
canvas.addEventListener("touchmove", (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    playerY = touchY - PADDLE_HEIGHT / 2;
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
}, { passive: false });

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#fff400"; // Pacman yellow
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball as a simple circle
    ctx.fillStyle = "#fff400";
    ctx.beginPath();
    ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw center dashed line
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "#b185ff"; // soft purple glow
    ctx.lineWidth = 3;
    ctx.shadowColor = "#b185ff";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.setLineDash([]);
}


// Update ball position and handle collisions
function updateBall() {
    ballX += ballVelX;
    ballY += ballVelY;

    // Bounce top/bottom
    if (ballY < 0) {
        ballY = 0;
        ballVelY *= -1;
    }
    if (ballY + BALL_SIZE > canvas.height) {
        ballY = canvas.height - BALL_SIZE;
        ballVelY *= -1;
    }

    // Player paddle collision
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT &&
        ballX >= PLAYER_X
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVelX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVelY = collidePoint * 0.25;
    }

    // AI paddle collision
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT &&
        ballX + BALL_SIZE <= AI_X + PADDLE_WIDTH + BALL_SIZE
    ) {
        ballX = AI_X - BALL_SIZE;
        ballVelX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVelY = collidePoint * 0.25;
    }

    // Score check
    if (ballX < 0) {
        aiScore++;
        updateScore();
        checkWin();
        resetBall(-1);
    }
    if (ballX + BALL_SIZE > canvas.width) {
        playerScore++;
        updateScore();
        checkWin();
        resetBall(1);
    }
}

// Reset ball to center after score
function resetBall(direction) {
    ballX = canvas.width / 2 - BALL_SIZE / 2;
    ballY = canvas.height / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * direction;
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Update the score display
function updateScore() {
    playerScoreEl.textContent = playerScore;
    aiScoreEl.textContent = aiScore;
}

// AI paddle movement
function updateAI() {
    const paddleCenter = aiY + PADDLE_HEIGHT / 2;
    if (paddleCenter < ballY + BALL_SIZE / 2 - 15) {
        aiY += PADDLE_SPEED;
    } else if (paddleCenter > ballY + BALL_SIZE / 2 + 15) {
        aiY -= PADDLE_SPEED;
    }

    // Keep AI paddle inside canvas
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT) aiY = canvas.height - PADDLE_HEIGHT;
}

// Check if someone won
function checkWin() {
    if (playerScore >= WIN_SCORE) {
        endGame("🎉 YOU WIN! 🎉");
    } else if (aiScore >= WIN_SCORE) {
        endGame("🤖 AI WINS! TRY AGAIN!");
    }
}

// End game, show message
function endGame(msg) {
    gameRunning = false;
    gameOver = true;
    gameMessage.textContent = msg;
    gameMessage.style.display = "block";
    restartBtn.style.display = "block";
}

// Reset game state
function resetGame() {
    playerScore = 0;
    aiScore = 0;
    playerY = (canvas.height - PADDLE_HEIGHT) / 2;
    aiY = playerY;
    resetBall(Math.random() > 0.5 ? 1 : -1);
    updateScore();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    updateBall();
    updateAI();
    draw();
    requestAnimationFrame(gameLoop);
}
