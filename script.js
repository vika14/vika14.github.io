var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var generalCompliments = [
	"красивая", "милая", "сладкая",
	"вкусная", "умная", "сексуальная",
	"горячая", "хорошая", "заботливая",
	"понимающая", "чудесная", "волшебная"
];
var lookCompliments = [
	"красивые глаза", "прекрасные губы", "замечательные волосы",
	"великолепные брови", "завораживающая шея", "нежные руки", 
];

const IN_GAME_GENERAL_COMPLIMENTS_NUMBER = 4;
const IN_GAME_LOOK_COMPLIMENTS_NUMBER = 2;

function getInGameCompliments(complimentsSource, comlimentsNumber) {
	usedIndexes = [];
	compliments = [];
	var complimentPosition = 0;

	while (complimentPosition < comlimentsNumber) {
		var newComplimentPosition;
		do {
			newComplimentPosition = getRandomInt(0, complimentsSource.length);
		} while (usedIndexes.indexOf(newComplimentPosition) !== -1);
		usedIndexes.push(newComplimentPosition);
		complimentPosition++;
		compliments.push(complimentsSource[newComplimentPosition]);
	}

	return compliments;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

var inGameGeneralCompliments = getInGameCompliments(generalCompliments, IN_GAME_GENERAL_COMPLIMENTS_NUMBER);
var inGameLookCompliments = getInGameCompliments(lookCompliments, IN_GAME_LOOK_COMPLIMENTS_NUMBER);

//Player START
const PLAYER_WIDTH = 15;
const PLAYER_HEIGHT = 15;

const PLAYER_SPEED = 2;

var playerXPosition = canvas.width / 2;
var playerYPosition = canvas.height / 2;

function drawPlayer() {
	ctx.beginPath();
	ctx.arc(playerXPosition, playerYPosition, PLAYER_WIDTH, 0, Math.PI * 2);
	ctx.fillStyle = "#0095DD";
	ctx.fill();
	ctx.closePath();
}
//Player END

//Enemy START
const ENEMIES_NUMBER = 4;
const ENEMY_HEALTH = 2;
const ENEMIES_START_POSITIONS = [
	{ xPosition: canvas.width / 4, yPosition: canvas.height / 4 },
	{ xPosition: canvas.width / 4 * 3, yPosition: canvas.height / 4 },
	{ xPosition: canvas.width / 4, yPosition: canvas.height / 4 * 3 },
	{ xPosition: canvas.width / 4 * 3, yPosition: canvas.height / 4 * 3 },
];
const ENEMIES_COLORS = [
	"#9C27B0",
	"#673AB7",
	"#1976D2",
	"#00796B",
	"#FF5722",
	"#607D8B",
	"#D50000",
];
const ENEMY_RADIUS = 20;
const ENEMY_HEALTH_TEXT_X_OFFSET = -4;
const ENEMY_HEALTH_TEXT_Y_OFFSET = 5;

function buildEnemies(enemiesNumber) {
	var enemies = [];
	for (var enemyPosition = 0; enemyPosition < enemiesNumber; enemyPosition++) {
		var enemyColor = getEnemyColor();
		enemies.push({ 
			xPosition: 0,
			yPosition: 0,
			health: ENEMY_HEALTH,
			color: enemyColor });
	}

	return enemies;
}

function getEnemyColor() {
	var colorPosition = getRandomInt(0, ENEMIES_COLORS.length);

	return ENEMIES_COLORS[colorPosition];
}

function placeEnemies(enemies) {
	for (var enemyPosition = 0;
			 enemyPosition < enemies.length && enemyPosition < ENEMIES_START_POSITIONS.length;
			 enemyPosition++) {
		enemies[enemyPosition].xPosition = ENEMIES_START_POSITIONS[enemyPosition].xPosition;
		enemies[enemyPosition].yPosition = ENEMIES_START_POSITIONS[enemyPosition].yPosition;
	}
}

function registerCollisionWithBullet(enemies, enemyPosition) {
	var enemy = enemies[enemyPosition];
	enemy.health--;
	if (enemy.health === 0) {
		removeEnemy(enemies, enemyPosition);
	}
}

function removeEnemy(enemies, enemyPosition) {
	enemies.splice(enemyPosition, 1);
}

function drawEnemies(enemies) {
	for (var enemyPosition = 0; enemyPosition < enemies.length; enemyPosition++) {
		drawEnemy(enemies[enemyPosition]);
	}
}

function drawEnemy(enemy) {
	drawEnemyBody(enemy);
	drawEnemyHealth(enemy);
}

function drawEnemyBody(enemy) {
	ctx.beginPath();
	ctx.arc(enemy.xPosition, enemy.yPosition, ENEMY_RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = enemy.color;
	ctx.fill();
	ctx.closePath();
}

function drawEnemyHealth(enemy) {
	ctx.font = "16px Arial";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(
		enemy.health,
		enemy.xPosition + ENEMY_HEALTH_TEXT_X_OFFSET,
		enemy.yPosition + ENEMY_HEALTH_TEXT_Y_OFFSET);
}

var enemies = buildEnemies(ENEMIES_NUMBER);
placeEnemies(enemies);
//Enemy END

//Bullet START
const BULLET_RADIUS = 5;
const BULLET_SPEED = 4;

var bulletsXCurrentDirection = 0;
var bulletsYCurrentDirection = -1;
var bullets = [];

function emitBullet(startXPosition, startYPosition) {
	bullets.push({ 
		xPosition: startXPosition,
		yPosition: startYPosition,
		inPullPosition: bullets.length,
		xDirection: bulletsXCurrentDirection,
		yDirection: bulletsYCurrentDirection 
	});
}

function removeNeededBullets(bullets) {
	for (var bulletPosition = 0; bulletPosition < bullets.length; bulletPosition++) {
		var bullet = bullets[bulletPosition];
		if (bullet.xPosition < 0 || bullet.xPosition > canvas.width
				|| bullet.yPosition < 0 || bullet.yPosition > canvas.height) {
			removeBullet(bulletPosition);
		}
	}
}

function removeBullet(bulletPosition) {
	bullets.splice(bulletPosition, 1);
	updateInPullPositions(bulletPosition, bullets);
}

function updateInPullPositions(startPosition, bullets) {
	for (var bulletPosition = startPosition; bulletPosition < bullets.length; bulletPosition++) {
		bullets[bulletPosition].inPullPosition--;
	}
}

function moveAllBullets(bullets) {
	for (var bulletPosition = 0; bulletPosition < bullets.length; bulletPosition++) {
		moveBullet(bullets[bulletPosition]);
	}
}

function moveBullet(bullet) {
	bullet.xPosition += bullet.xDirection;
	bullet.yPosition += bullet.yDirection;
	detectCollisionAndRemoveEnemy(bullet, enemies);
}

function detectCollisionAndRemoveEnemy(bullet, enemies) {
	var enemyPosition = 0;
	while (enemyPosition < enemies.length) {
		var enemy = enemies[enemyPosition];
		if (isHitEnemy(bullet, enemy)) {
			registerCollisionWithBullet(enemies, enemyPosition);
			removeBullet(bullet.inPullPosition);
			break;
		} else {
			enemyPosition++;
		}
	}
}

function isHitEnemy(bullet, enemy) {
	var distance = getDistanceBetweenPoints(bullet.xPosition, bullet.yPosition,
											enemy.xPosition, enemy.yPosition);
	var radiusedSum = BULLET_RADIUS + ENEMY_RADIUS;

	return distance <= radiusedSum;
}

function getDistanceBetweenPoints(firstX, firstY, secondX, secondY) {
	var xDifferenceSqr = Math.pow(firstX - secondX, 2);
	var yDifferenceSqr = Math.pow(firstY - secondY, 2);

	return Math.sqrt(xDifferenceSqr + yDifferenceSqr);
}

function setBulletsDirection(newXDirection, newYDirection) {
	if (newXDirection === 0 && newYDirection === 0) {
		newXDirection = 0;
		newYDirection = -1;
	}

	speedCoefficient = getCurrentDirectionSpeedCoefficient(newXDirection, newYDirection);

	bulletsXCurrentDirection = newXDirection * speedCoefficient;
	bulletsYCurrentDirection = newYDirection * speedCoefficient;
}

function getCurrentDirectionSpeedCoefficient(newXDirection, newYDirection) {
	var speedCoefficient = 1;
	if (Math.abs(newXDirection) > Math.abs(newYDirection)) {
		speedCoefficient = Math.abs(newXDirection) / BULLET_SPEED;
	} else {
		speedCoefficient = Math.abs(newYDirection) / BULLET_SPEED;
	}

	return 1 / speedCoefficient;
}

function drawAllBullets(bullets) {
	for (var bulletPosition = 0; bulletPosition < bullets.length; bulletPosition++) {
		drawBullet(bullets[bulletPosition]);
	}
}

function drawBullet(bullet) {
	ctx.beginPath();
	ctx.arc(bullet.xPosition, bullet.yPosition, BULLET_RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = "#FF0000";
	ctx.fill();
	ctx.closePath();
}
//Bullet END

//Controls START
var upPressed;
var downPressed;
var leftPressed;
var rightPressed;

const UP_KEY_CODE = 38;
const DOWN_KEY_CODE = 40;
const LEFT_KEY_CODE = 37;
const RIGHT_KEY_CODE = 39;

function keyDownHandler(e) {
	switch (e.keyCode) {
		case UP_KEY_CODE:
			upPressed = true;
			break;
		case DOWN_KEY_CODE:
			downPressed = true;
			break;
		case LEFT_KEY_CODE:
			leftPressed = true;
			break;
		case RIGHT_KEY_CODE:
			rightPressed = true;
			break;
	}
}

function keyUpHandler(e) {
	switch (e.keyCode) {
		case UP_KEY_CODE:
			upPressed = false;
			break;
		case DOWN_KEY_CODE:
			downPressed = false;
			break;
		case LEFT_KEY_CODE:
			leftPressed = false;
			break;
		case RIGHT_KEY_CODE:
			rightPressed = false;
			break;
	}
}

function attackPressListener(e) {
	emitBullet(playerXPosition, playerYPosition);
}

function mouseMoveListener(e) {
	var mousePosition = getMousePosition(e);
	if (isMouseAtCanvas(mousePosition, canvas)) { 
		var directionVector = getDirectionVector(mousePosition, playerXPosition, playerYPosition);
		setBulletsDirection(directionVector.x, directionVector.y);
	}
}

function getMousePosition(e) {
	var rect = canvas.getBoundingClientRect();
	return {
		xPosition: e.clientX - rect.left,
		yPosition: e.clientY - rect.top
	};
}

function isMouseAtCanvas(mousePosition, canvas) {
	return mousePosition.xPosition > 0 && mousePosition.xPosition < canvas.width 
			&& mousePosition.yPosition > 0 && mousePosition.yPosition < canvas.height
}

function getDirectionVector(mousePosition, playerXPosition, playerYPosition) {
	directionVector = { x: 0, y: 0 };

	directionVector.x = mousePosition.xPosition - playerXPosition;
	directionVector.y = mousePosition.yPosition - playerYPosition;

	/*if (directionVector.x !== 0) {
		directionVector.x /= Math.abs(directionVector.x);
	}
	if (directionVector.y !== 0) {
		directionVector.y /= Math.abs(directionVector.y);
	}*/

	return directionVector;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("click", attackPressListener, false);
document.addEventListener("mousemove", mouseMoveListener, false);
//Controls END

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
	clearCanvas();
	drawPlayer();
	drawEnemies(enemies);
	drawAllBullets(bullets);

	if (upPressed) {
		playerYPosition -= PLAYER_SPEED;
	}
	if (downPressed) {
		playerYPosition += PLAYER_SPEED;
	}
	if (leftPressed) {
		playerXPosition -= PLAYER_SPEED;
	}
	if (rightPressed) {
		playerXPosition += PLAYER_SPEED;
	}

	moveAllBullets(bullets);
	removeNeededBullets(bullets);

	requestAnimationFrame(draw);
}

draw();