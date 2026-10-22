const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - 55,
  width: 14,
  height: 110,
  speed: 8
};

const rightPaddle = {
  x: canvas.width - 34,
  y: canvas.height / 2 - 55,
  width: 14,
  height: 110,
  speed: 5.2
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 9,
  speed: 6.5,
  vx: 0,
  vy: 0
};

const keys = {
  ArrowUp: false,
  ArrowDown: false
};

let leftScore = 0;
let rightScore = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const angle = (Math.random() * (Math.PI / 2)) - (Math.PI / 4);
  const speed = ball.speed;

  ball.vx = direction * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}

function handlePaddleCollision(paddle, side) {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const overlaps =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  if (!overlaps) return;

  const relativeIntersectY =
    (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);

  const bounceAngle = relativeIntersectY * (Math.PI / 3);

  const direction = side === "left" ? 1 : -1;
  const speed = Math.min(ball.speed + 0.4, 12);

  ball.speed = speed;
  ball.vx = direction * speed * Math.cos(bounceAngle);
  ball.vy = speed * Math.sin(bounceAngle);

  if (side === "left") {
    ball.x = paddle.x + paddle.width + ball.radius;
  } else {
    ball.x = paddle.x - ball.radius;
  }
}

function updateLeftPaddle() {
  let movement = 0;

  if (keys.ArrowUp) movement -= 1;
  if (keys.ArrowDown) movement += 1;

  leftPaddle.y += movement * leftPaddle.speed;

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function updateRightPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
  const targetY = ball.y - rightPaddle.height / 2;

  const diff = targetY - paddleCenter;
  const move = clamp(diff, -rightPaddle.speed, rightPaddle.speed);

  rightPaddle.y += move;
  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
  }

  if (
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height
  ) {
    handlePaddleCollision(leftPaddle, "left");
  }

  if (
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height
  ) {
    handlePaddleCollision(rightPaddle, "right");
  }

  if (ball.x - ball.radius <= 0) {
    rightScore++;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= canvas.width) {
    leftScore++;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawNet() {
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 14]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#60a5fa";
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawNet();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  updateLeftPaddle();
  updateRightPaddle();
  updateBall();
  draw();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }

  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;

  leftPaddle.y = mouseY - leftPaddle.height / 2;
  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);
