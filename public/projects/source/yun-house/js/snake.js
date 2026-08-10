const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const [up, down, left, right] = document.querySelectorAll(".controls i");

const updateFoodPosition = () => {
  const randomPosition = () => Math.floor(Math.random() * 30) + 1;
  foodX = randomPosition();
  foodY = randomPosition();
};

const handleGameOver = () => {
  clearInterval(setIntervalId);
  alert("Game Over😭 Press OK to play agian");
  location.reload();
};

const changeDirection = ({ key }) => {
  if (key === "ArrowUp" && velocityY !== 1) {
    [velocityX, velocityY] = [0, -1];
  } else if (key === "ArrowDown" && velocityY !== -1) {
    [velocityX, velocityY] = [0, 1];
  } else if (key === "ArrowLeft" && velocityX !== 1) {
    [velocityX, velocityY] = [-1, 0];
  } else if (key === "ArrowRight" && velocityX !== -1) {
    [velocityX, velocityY] = [1, 0];
  }
};


const speedBtn = document.getElementById('speed-btn');
speedBtn.addEventListener('click', changeInterval);

[up, down, left, right].forEach((button) =>
  button.addEventListener("click", () =>
    changeDirection({ key: button.dataset.key })
  )
);

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;

const initGame = () => {
  if (gameOver) return handleGameOver();

  let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

  if (snakeX === foodX && snakeY === foodY) {
    updateFoodPosition();
    snakeBody.push([foodY, foodX]);
    score++;
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
  }

  snakeX += velocityX;
  snakeY += velocityY;

  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    return (gameOver = true);
  }

  html += Array.from(snakeBody, ([x, y]) => `<div class="head" style="grid-area: ${y} / ${x}"></div>`).join("");
/*
This code is based upon an example from the Youtube tutorial on Comments Author: CodingNepal
Location: https://www.youtube.com/watch?v=K8Rh5x3c9Pw
Accessed: 03/04/2023
*/
/* I added the following lines to add a easy mode and conditions for win a prize */
  if (snakeBody.some(([x, y], i) => i !== 0 && snakeBody[0][1] === x && snakeBody[0][0] === y)) {
    gameOver = true;
  }
  
  if (score >= 30) {
    html += '<div class="message" style="grid-area: 15 / 15; text-align: center;">Congratulations! Grab your free snack!!!</div>';
  }

  playBoard.innerHTML = html;
};



updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);

function changeInterval() {
  clearInterval(setIntervalId);
  setIntervalId = setInterval(initGame, 300);
}
/*End of my modification*/