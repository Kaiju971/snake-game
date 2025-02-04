// Configuration
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

const config = {
  cellSize: 20,
  fps: 100,
};

let gameState = {
  snake: [{ x: 5, y: 5 }],
  food: { x: 10, y: 10 },
  direction: "right",
  nextDirection: "right",
  score: 0,
};

let touchStartX = 0,
  touchStartY = 0,
  touchEndX = 0,
  touchEndY = 0;

// Initialize the game
function initGame() {
  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("touchstart", handleTouchStart);
  document.addEventListener("touchmove", (e) => e.preventDefault(), {
    passive: false,
  });
  document.addEventListener("touchend", handleTouchEnd);
  spawnFood();
  gameLoop();
}

// Handle key presses for desktop
function handleKeyPress(event) {
  const keyDirection = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  const newDirection = keyDirection[event.key];

  if (newDirection && !gameOver) {
    if (
      (newDirection === "up" && gameState.direction !== "down") ||
      (newDirection === "down" && gameState.direction !== "up") ||
      (newDirection === "left" && gameState.direction !== "right") ||
      (newDirection === "right" && gameState.direction !== "left")
    ) {
      gameState.nextDirection = newDirection;
    }
  }
}

// Gestion du swipe mobile
function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].clientX;
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();

  // Réinitialisation des coordonnées après chaque swipe
  touchStartX = 0;
  touchStartY = 0;
  touchEndX = 0;
  touchEndY = 0;
}

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  // Horizontal swipe (left/right)
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && gameState.direction !== "left")
      gameState.nextDirection = "right";
    else if (dx < 0 && gameState.direction !== "right")
      gameState.nextDirection = "left";
  }
  // Vertical swipe (up/down)
  else {
    if (dy > 0 && gameState.direction !== "up")
      gameState.nextDirection = "down";
    else if (dy < 0 && gameState.direction !== "down")
      gameState.nextDirection = "up";
  }
}

// Spawn food at a random position
function spawnFood() {
  const maxCells = canvas.width / config.cellSize;
  gameState.food = {
    x: Math.floor(Math.random() * maxCells),
    y: Math.floor(Math.random() * maxCells),
  };
}

// Check for collisions
function checkCollision(x, y) {
  if (
    x < 0 ||
    x >= canvas.width / config.cellSize ||
    y < 0 ||
    y >= canvas.height / config.cellSize
  ) {
    return true;
  }

  for (let cell of gameState.snake) {
    if (cell.x === x && cell.y === y) {
      return true;
    }
  }

  return false;
}

// Update game state
function updateGame() {
  const head = { ...gameState.snake[0] };
  gameState.direction = gameState.nextDirection;

  switch (gameState.direction) {
    case "up":
      head.y -= 1;
      break;
    case "down":
      head.y += 1;
      break;
    case "left":
      head.x -= 1;
      break;
    case "right":
      head.x += 1;
      break;
  }

  if (checkCollision(head.x, head.y)) {
    resetGame();
    return;
  }

  if (head.x === gameState.food.x && head.y === gameState.food.y) {
    gameState.snake.unshift(head);
    gameState.score++;
    scoreDisplay.textContent = `Score: ${gameState.score}`;
    spawnFood();
  } else {
    gameState.snake.unshift(head);
    gameState.snake.pop();
  }
}

let gameOver = false;

// Reset the game
function resetGame() {
  alert(`Game Over! Your score was ${gameState.score}`);
  gameOver = true; // Bloque la boucle du jeu

  // Ajouter un événement pour relancer le jeu après un game over
  document.addEventListener("keydown", restartGame);
  document.addEventListener("touchstart", restartGame);
}

// Fonction pour redémarrer le jeu après un game over
function restartGame() {
  // Vérifier que le jeu est bien terminé avant de relancer
  if (!gameOver) return;

  gameOver = false;
  gameState = {
    snake: [{ x: 5, y: 5 }],
    food: { x: 10, y: 10 },
    direction: "right",
    nextDirection: "right",
    score: 0,
  };
  scoreDisplay.textContent = "Score: 0";
  spawnFood();
  gameLoop();

  // Supprimer les écouteurs après redémarrage
  document.removeEventListener("keydown", restartGame);
  document.removeEventListener("touchstart", restartGame);
}

// Draw the game
function drawGame() {
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "blue";
  for (let cell of gameState.snake) {
    context.fillRect(
      cell.x * config.cellSize,
      cell.y * config.cellSize,
      config.cellSize,
      config.cellSize
    );
  }

  context.fillStyle = "lightgreen";
  context.fillRect(
    gameState.food.x * config.cellSize,
    gameState.food.y * config.cellSize,
    config.cellSize,
    config.cellSize
  );
}

// Game loop
function gameLoop() {
  if (gameOver) return; // Stoppe le jeu si gameOver est activé
  updateGame();
  drawGame();
  setTimeout(() => requestAnimationFrame(gameLoop), 15000 / config.fps);
}

// Start the game
initGame();
