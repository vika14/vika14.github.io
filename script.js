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
var complimentsForDraw = [];
var gottenCompliments = [];

const IN_GAME_GENERAL_COMPLIMENTS_NUMBER = 4;
const IN_GAME_LOOK_COMPLIMENTS_NUMBER = 2;
const COMPLIMENT_FONT = "16px Arial";
COMPLIMENT_START_OPACITY = 1;
const COMPLIMENT_OPACITY_DIFF = 0.025;
const GENERAL_COMPLIMENT_TYPE = 0;
const LOOK_COMPLIMENT_TYPE = 1;

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

function shuffle(array) {
    var j, x, i;
    for (i = array.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = array[i - 1];
        array[i - 1] = array[j];
        array[j] = x;
    }
}

var inGameGeneralCompliments = getInGameCompliments(generalCompliments, IN_GAME_GENERAL_COMPLIMENTS_NUMBER);
var inGameLookCompliments = getInGameCompliments(lookCompliments, IN_GAME_LOOK_COMPLIMENTS_NUMBER);

var inGameAllCompliments = buildInGameAllCompliments(inGameGeneralCompliments, inGameLookCompliments);
shuffle(inGameAllCompliments);
const ALL_COMPLIMENTS_NUMBER = inGameAllCompliments.length;

function buildInGameAllCompliments(inGameGeneralCompliments, inGameLookCompliments) {
	var compliments = [];
	var position = 0;
	for (var complimentPosition = 0;
			complimentPosition < inGameGeneralCompliments.length;
			complimentPosition++, position++) {
		compliments.push({
			text: inGameGeneralCompliments[complimentPosition],
			type: GENERAL_COMPLIMENT_TYPE
		});
	}
	for (var complimentPosition = 0;
			complimentPosition < inGameLookCompliments.length;
			complimentPosition++, position++) {
		compliments.push({
			text: inGameLookCompliments[complimentPosition],
			type: LOOK_COMPLIMENT_TYPE
		});
	}

	return compliments;
} 

function drawAllCompliments() {
	for (var complimentPosition = 0; complimentPosition < complimentsForDraw.length; complimentPosition++) {
		drawCompliment(complimentsForDraw[complimentPosition]);
		changeComplimentOpcity(complimentsForDraw, complimentPosition);
		if (complimentsForDraw[complimentPosition].opacity === 0) {
			removeCompliment(complimentsForDraw, complimentPosition);
		}
	}
}

function drawCompliment(compliment) {
	ctx.font = COMPLIMENT_FONT;
	ctx.fillStyle = compliment.color;
	ctx.fillText(compliment.text.text, compliment.xPosition, compliment.yPosition);
}

function changeComplimentOpcity(compliments, complimentPosition) {
	var opacity = compliments[complimentPosition].opacity;
	var color = compliments[complimentPosition].color;

	opacity -= COMPLIMENT_OPACITY_DIFF;
	color = updateColorOpacity(color, opacity);

	compliments[complimentPosition].opacity = opacity;
	compliments[complimentPosition].color = color;
}

function updateColorOpacity(color, opacity) {
	if (opacity !== 0) {
		var opacityPosition = color.lastIndexOf(",");
		var newColorPart = color.substring(0, opacityPosition + 1);
		var newColor = newColorPart + opacity.toString() + ")";

		return newColor;
	}

	return color;
}

function removeCompliment(complimentsForDraw, complimentPosition) {
	complimentsForDraw.splice(complimentPosition, 1);
}

function addCompliment(
		complimentText, complimentColor,
		complimentXPosition, complimentYPosition,
		complimentOpacity, complimentType) {
	var compliment = {
		text: complimentText,
		color: hexToRgba(complimentColor, complimentOpacity),
		xPosition: complimentXPosition,
		yPosition: complimentYPosition,
		opacity: complimentOpacity,
		type: complimentType
	};
	complimentsForDraw.push(compliment);
	gottenCompliments.push(compliment);
}

function hexToRgba(hex, opacity){
    hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    var result = "rgba("+r+","+g+","+b+","+opacity+")";
    return result;
}

//Player START
const PLAYER_WIDTH = 15;
const PLAYER_HEIGHT = 15;
const PLAYER_COLOR = "#0095DD";
const PLAYER_BULLET_COLOR = PLAYER_COLOR;

const PLAYER_SPEED = 2;

var playerXPosition = canvas.width / 2;
var playerYPosition = canvas.height / 2;
var playerHealth = 3;

var mouseCurrentXPosition;
var mouseCurrentYPosition;

function registerCollisionPlayerWithBullet() {
	playerHealth--;
	if (playerHealth === 0) {
		isGame = false;
	}
}

function movePlayer() {
	if (upPressed && playerYPosition - PLAYER_HEIGHT >= 0) {
		playerYPosition -= PLAYER_SPEED;
	}
	if (downPressed && playerYPosition + PLAYER_HEIGHT <= canvas.height) {
		playerYPosition += PLAYER_SPEED;
	}
	if (leftPressed && playerXPosition - PLAYER_WIDTH >= 0) {
		playerXPosition -= PLAYER_SPEED;
	}
	if (rightPressed && playerXPosition + PLAYER_WIDTH <= canvas.width) {
		playerXPosition += PLAYER_SPEED;
	}
}

function drawPlayer() {
	ctx.beginPath();
	ctx.arc(playerXPosition, playerYPosition, PLAYER_WIDTH, 0, Math.PI * 2);
	ctx.fillStyle = PLAYER_COLOR;
	ctx.fill();
	ctx.closePath();
}
//Player END

//Enemy START
const ENEMIES_NUMBER = 4;
const ENEMIES_ADDITION_SPAWN_TIMES = ALL_COMPLIMENTS_NUMBER - ENEMIES_NUMBER;
const ENEMY_HEALTH = 2;
const ENEMIES_START_POSITIONS = [
	{ xPosition: canvas.width / 4, yPosition: canvas.height / 4 },
	{ xPosition: canvas.width / 4 * 3, yPosition: canvas.height / 4 },
	{ xPosition: canvas.width / 4, yPosition: canvas.height / 4 * 3 },
	{ xPosition: canvas.width / 4 * 3, yPosition: canvas.height / 4 * 3 },
];
const ENEMY_PATH_COLUMNS_NUMBER = 10;
const ENEMY_PATH_ROWS_NUMBER = 10;
const ENEMY_PATH_LENGTH = 16;
const ENEMY_SPEED = 5;
const ENEMIES_COLORS = [
	"#9C27B0",
	"#673AB7",
	"#1976D2",
	"#00796B",
	"#FF5722",
	"#607D8B",
	"#D50000",
];
const ENEMY_BULLET_COLOR = "#6D4C41";
const ENEMY_BULLET_SPEED = 3;
const ENEMY_RADIUS = 20;
const ENEMY_HEALTH_TEXT_X_OFFSET = -4;
const ENEMY_HEALTH_TEXT_Y_OFFSET = 5;

var complimentPosition = 0;
var additionSpawnedEnemies = 0;

function buildEnemies(enemiesNumber) {
	var enemies = [];
	for (var enemyPosition = 0; enemyPosition < enemiesNumber; enemyPosition++) {
		var enemyColor = getEnemyColor();
		var enemyCompliment = getEnemyCompliment();
		enemies.push({ 
			xPosition: 0,
			yPosition: 0,
			health: ENEMY_HEALTH,
			color: enemyColor,
			path: [],
			pathCurrentPosition: 0,
			xDirection: 0,
			yDirection: 0,
			compliment: enemyCompliment
		});
	}

	return enemies;
}

function buildEnemy(enemies) {

}

function getEnemyColor() {
	var colorPosition = getRandomInt(0, ENEMIES_COLORS.length);

	return ENEMIES_COLORS[colorPosition];
}

function getEnemyCompliment() {
	if (complimentPosition !== inGameAllCompliments.length) {
		var compliment = inGameAllCompliments[complimentPosition];
		complimentPosition++;
		return compliment;
	}

	return "";
}

function placeEnemies(enemies) {
	for (var enemyPosition = 0;
			 enemyPosition < enemies.length && enemyPosition < ENEMIES_START_POSITIONS.length;
			 enemyPosition++) {
		placeEnemy(enemies, enemyPosition, enemyPosition);
	}
}

function placeEnemy(enemies, enemyPosition, startPointPosition) {
	enemies[enemyPosition].xPosition = ENEMIES_START_POSITIONS[startPointPosition].xPosition;
	enemies[enemyPosition].yPosition = ENEMIES_START_POSITIONS[startPointPosition].yPosition;
}

function buildPathesForEnemies(enemies, canvas) {
	for (var enemyPosition = 0; enemyPosition < enemies.length; enemyPosition++) {
		var startPoint = { 
			xPosition: enemies[enemyPosition].xPosition,
			yPosition: enemies[enemyPosition].yPosition
		};
		var path = buildPath(startPoint, ENEMY_PATH_LENGTH,
							 ENEMY_PATH_COLUMNS_NUMBER, ENEMY_PATH_ROWS_NUMBER, canvas);
		enemies[enemyPosition].path = path;
	}
}

function buildPath(startPoint, pathLength, pathColumnsNumber, pathRowsNumber, canvas) {
	path = [startPoint];

	for (var pathPartPosition = 1; pathPartPosition < pathLength; pathPartPosition++) {
		var columnPosition = getRandomInt(0, pathColumnsNumber);
		var rowPosition = getRandomInt(0, pathRowsNumber);

		var x = canvas.width / columnPosition;
		var y = canvas.height / rowPosition;

		if (x === 0 || x == Infinity) {
			x = 0 + ENEMY_RADIUS;
		}
		if (x === canvas.width) {
			x -= ENEMY_RADIUS;
		}
		if (y === 0 || y == Infinity) {
			y = 0 + ENEMY_RADIUS;
		}
		if (y === canvas.height) {
			y -= ENEMY_RADIUS;
		}

		var pathPoint = { xPosition: x, yPosition: y };
		path.push(pathPoint);
	}

	return path;
}

function registerCollisionEnemyWithBullet(enemies, enemyPosition) {
	var enemy = enemies[enemyPosition];
	enemy.health--;
	if (enemy.health === 0) {
		addCompliment(enemy.compliment, enemy.color,
					  enemy.xPosition, enemy.yPosition,
					  COMPLIMENT_START_OPACITY, enemy.compliment.type);
		removeEnemy(enemies, enemyPosition);
		if (canSpawnNewEnemy()) {
			spawnNewEnemy(enemies);
		} else if (enemies.length === 0) {
			isGame = false;
		}
	}
}

function removeEnemy(enemies, enemyPosition) {
	enemies.splice(enemyPosition, 1);
}

function canSpawnNewEnemy() {
	var result = additionSpawnedEnemies !== ENEMIES_ADDITION_SPAWN_TIMES;
	if (result) {
		additionSpawnedEnemies++;
	}
	return result;
}

function spawnNewEnemy(enemies) {
	var newEnemies = buildEnemies(1);
	var enemySpawnPosition = getRandomInt(0, ENEMIES_START_POSITIONS.length);
	placeEnemy(newEnemies, 0, enemySpawnPosition);
	buildPathesForEnemies(newEnemies, canvas);

	enemies.push(newEnemies[0]);
}

function moveEnemies(enemies) {
	for (var enemyPosition = 0; enemyPosition < enemies.length; enemyPosition++) {
		moveEnemy(enemies[enemyPosition]);
	}
}

function moveEnemy(enemy) {
	var nextPathPointPosition;

	if (enemy.pathCurrentPosition == ENEMY_PATH_LENGTH - 1) {
		nextPathPointPosition = 0;
	} else {
		nextPathPointPosition = enemy.pathCurrentPosition + 1;
	}
	if (enemy.pathCurrentPosition == ENEMY_PATH_LENGTH - 1) {
		enemy.pathCurrentPosition = 0;
	}

	var pathNextPoint = enemy.path[nextPathPointPosition];
	if (isAtThePoint(pathNextPoint, {xPosition: enemy.xPosition, yPosition: enemy.yPosition })) {
		enemy.pathCurrentPosition++;
	} else {
		var direction = getDirectionVector(pathNextPoint, enemy.xPosition, enemy.yPosition);
		setEmenyDirection(enemy, direction);

		enemy.xPosition += enemy.xDirection;
		enemy.yPosition += enemy.yDirection;
	}
}

function isAtThePoint(target, pointPosition) {
	var distance = getDistanceBetweenPoints(target.xPosition, target.yPosition,
											pointPosition.xPosition, pointPosition.yPosition);
	return distance <= ENEMY_RADIUS;

}

function setEmenyDirection(enemy, direction) {
	speedCoefficient = getCurrentDirectionSpeedCoefficient(direction.x, direction.y, ENEMY_SPEED);

	enemy.xDirection = direction.x * speedCoefficient;
	enemy.yDirection = direction.y * speedCoefficient;
} 

function attackPlayer(enemies) {
	for (var enemyPosition = 0; enemyPosition < enemies.length; enemyPosition++) {
		makeAttack(enemies[enemyPosition]);
	}
}

function makeAttack(enemy) {
	emitBullet(enemy.xPosition, enemy.yPosition, playerXPosition, playerYPosition, false);
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
buildPathesForEnemies(enemies, canvas);
//Enemy END

//Bullet START
const BULLET_RADIUS = 5;
const BULLET_SPEED = 4;

var bulletsXCurrentDirection = 0;
var bulletsYCurrentDirection = -1;
var bullets = [];

function emitBullet(startXPosition, startYPosition, targetXPosition, targetYPosition, playerBullet) {
	var bulletColor;
	var bulletSpeed;
	if (playerBullet) {
		bulletColor = PLAYER_BULLET_COLOR;
		bulletSpeed = BULLET_SPEED;
	} else {
		bulletColor = ENEMY_BULLET_COLOR;
		bulletSpeed = ENEMY_BULLET_SPEED;
	}

	var target = { xPosition: targetXPosition, yPosition: targetYPosition};
	var direction = getDirectionVector(target, startXPosition, startYPosition);
	speedCoefficient = getCurrentDirectionSpeedCoefficient(direction.x, direction.y, bulletSpeed);

	bullets.push({ 
		xPosition: startXPosition,
		yPosition: startYPosition,
		inPullPosition: bullets.length,
		xDirection: direction.x * speedCoefficient,
		yDirection: direction.y * speedCoefficient,
		isPlayerBullet: playerBullet,
		color: bulletColor
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
	detectCollisionAndRemoveCharacter(bullet, enemies);
}

function detectCollisionAndRemoveCharacter(bullet, enemies) {
	if (bullet.isPlayerBullet) {
		detectCollisionWithEnemy(bullet, enemies);
	} else {
		detectCollisionWithPlayer(bullet);
	}
}

function detectCollisionWithEnemy(bullet, enemies) {
	var enemyPosition = 0;
	while (enemyPosition < enemies.length) {
		var enemy = enemies[enemyPosition];
		if (isHitWithCharacter(bullet, enemy, ENEMY_RADIUS)) {
			registerCollisionEnemyWithBullet(enemies, enemyPosition);
			removeBullet(bullet.inPullPosition);
			break;
		} else {
			enemyPosition++;
		}
	}
}

function detectCollisionWithPlayer(bullet) {
	if (isHitWithCharacter(bullet, { xPosition: playerXPosition, yPosition: playerYPosition }, PLAYER_WIDTH)) {
		registerCollisionPlayerWithBullet();
		removeBullet(bullet.inPullPosition);
	}
}

function isHitWithCharacter(bullet, character, characterRadius) {
	var distance = getDistanceBetweenPoints(bullet.xPosition, bullet.yPosition,
											character.xPosition, character.yPosition);
	var radiusesSum = BULLET_RADIUS + characterRadius;

	return distance <= radiusesSum;
}

function getDistanceBetweenPoints(firstX, firstY, secondX, secondY) {
	var xDifferenceSqr = Math.pow(firstX - secondX, 2);
	var yDifferenceSqr = Math.pow(firstY - secondY, 2);

	return Math.sqrt(xDifferenceSqr + yDifferenceSqr);
}

function setAllBulletsDirection(newXDirection, newYDirection) {
	for (var bulletPosition = 0; bulletPosition < bulles.length; bulletPosition++) {
		setBulletDirection()
	}
}

function setBulletDirection(bullet, newXDirection, newYDirection) {
	if (newXDirection === 0 && newYDirection === 0) {
		newXDirection = 0;
		newYDirection = -1;
	}

	speedCoefficient = getCurrentDirectionSpeedCoefficient(newXDirection, newYDirection, BULLET_SPEED);

	bullet.xDirection = newXDirection * speedCoefficient;
	bullet.yDirection = newYDirection * speedCoefficient;
}

function drawAllBullets(bullets) {
	for (var bulletPosition = 0; bulletPosition < bullets.length; bulletPosition++) {
		drawBullet(bullets[bulletPosition]);
	}
}

function drawBullet(bullet) {
	ctx.beginPath();
	ctx.arc(bullet.xPosition, bullet.yPosition, BULLET_RADIUS, 0, Math.PI * 2);
	ctx.fillStyle = bullet.color;
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
	emitBullet(playerXPosition, playerYPosition, mouseCurrentXPosition, mouseCurrentYPosition, true);
}

function mouseMoveListener(e) {
	var mousePosition = getMousePosition(e);
	if (isMouseAtCanvas(mousePosition, canvas)) { 
		var directionVector = getDirectionVector(mousePosition, playerXPosition, playerYPosition);
		mouseCurrentXPosition = mousePosition.xPosition;
		mouseCurrentYPosition = mousePosition.yPosition;
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

function getDirectionVector(target, startXPosition, startYPosition) {
	directionVector = { x: 0, y: 0 };

	directionVector.x = target.xPosition - startXPosition;
	directionVector.y = target.yPosition - startYPosition;

	/*if (directionVector.x !== 0) {
		directionVector.x /= Math.abs(directionVector.x);
	}
	if (directionVector.y !== 0) {
		directionVector.y /= Math.abs(directionVector.y);
	}*/

	return directionVector;
}

function getCurrentDirectionSpeedCoefficient(newXDirection, newYDirection, speed) {
	var speedCoefficient = 1;
	if (Math.abs(newXDirection) > Math.abs(newYDirection)) {
		speedCoefficient = Math.abs(newXDirection) / speed;
	} else {
		speedCoefficient = Math.abs(newYDirection) / speed;
	}

	return 1 / speedCoefficient;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("click", attackPressListener, false);
document.addEventListener("mousemove", mouseMoveListener, false);
//Controls END

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const DELAY_BETWEEN_ATTACKS = 950;
const DELAY_FIRST_ATTACK = 1500;

function startAttacking() {
	setInterval(function () { attackPlayer(enemies); }, DELAY_BETWEEN_ATTACKS);
}

setTimeout(startAttacking, DELAY_FIRST_ATTACK);

var isGame = true;
var isGameNotStarted = false;

function draw() {
	clearCanvas();

	if (isGame) {
		drawGame();
		movePlayer();
		moveEnemies(enemies);
		moveAllBullets(bullets);
		removeNeededBullets(bullets);
	} else if (isGameNotStarted) {

	} else {
		notifyGameOver();
		if (playerHealth > 0) {
			showCompliments(gottenCompliments);
		}
	}

	requestAnimationFrame(draw);
}

function drawGame() {
	drawAllCompliments();
	drawScore();
	drawHealth();
	drawPlayer();
	drawEnemies(enemies);
	drawAllBullets(bullets);
}

const UI_FONT = "16px Arial";
const UI_COLOR = "#0095DD";

const HEALTH_TITLE = "Осталось Вик";
const HEALTH_X_POSITION = 8;
const HEALTH_Y_POSITION = 20;

const SCORE_TITLE = "Убито врагов";
const SCORE_X_POSITION = canvas.width - 120;
const SCORE_Y_POSITION = 20;

const WIN_TEXT = "Победа";
const DEFEAT_TEXT = "Поражение";

const GAME_OVER_TEXT_X_POSIION = canvas.width - canvas.width / 2;
const GAME_OVER_TEXT_Y_POSITION = 50;

const GENERAL_COMPLIMENTS_TITLE_X_POSITION = 200;
const LOOK_COMPLIMENTS_TITLE_X_POSITION = 600;
const COMPLIMENTS_TITLES_Y_POSITION = 100;

const COMPLIMENT_TEXT_Y_DIFF = 40;
const GENERAL_COMPLIMENT_TEXT_X_POSITION = GENERAL_COMPLIMENTS_TITLE_X_POSITION;
const LOOK_COMPLIMENT_TEXT_X_POSITION = LOOK_COMPLIMENTS_TITLE_X_POSITION;

var GENERAL_COMPLIMENTS_Y_START = COMPLIMENTS_TITLES_Y_POSITION + COMPLIMENT_TEXT_Y_DIFF;
var LOOK_COMPLIMENTS_Y_START = GENERAL_COMPLIMENTS_Y_START;

const GENERAL_COMPLIMENTS_TITLE = "Ты самая";
const LOOK_COMPLIMENTS_TITLE = "У тебя";

const COMPLIMENTS_TITLE_FONT = "26px Arial";
const COMPLIMENTS_TITLE_COLOR = "#000000";

function drawHealth() {
	ctx.font = UI_FONT;
	ctx.fillStyle = UI_COLOR;
	ctx.fillText(HEALTH_TITLE + ": " + playerHealth,
				 HEALTH_X_POSITION, HEALTH_Y_POSITION);
}

function drawScore() {
	ctx.font = UI_FONT;
	ctx.fillStyle = UI_COLOR;
	ctx.fillText(SCORE_TITLE + ": " + gottenCompliments.length,
				 SCORE_X_POSITION, SCORE_Y_POSITION);
}

function notifyGameOver() {
	var text;
	if (playerHealth > 0) {
		text = WIN_TEXT;
	} else {
		text = DEFEAT_TEXT;
	}
	drawGameOverText(text);
}

function drawGameOverText(text) {
	ctx.font = COMPLIMENTS_TITLE_FONT;
	ctx.fillStyle = UI_COLOR;
	ctx.fillText(text, GAME_OVER_TEXT_X_POSIION, GAME_OVER_TEXT_Y_POSITION);
}

function showCompliments(compliments) {
	drawComplimentsTitle(GENERAL_COMPLIMENTS_TITLE,
						 GENERAL_COMPLIMENTS_TITLE_X_POSITION,
						 COMPLIMENTS_TITLES_Y_POSITION);
	drawComplimentsTitle(LOOK_COMPLIMENTS_TITLE,
						 LOOK_COMPLIMENTS_TITLE_X_POSITION,
						 COMPLIMENTS_TITLES_Y_POSITION);
	drawGottenCopmliments(gottenCompliments);
}

function drawComplimentsTitle(title, x, y) {
	ctx.font = COMPLIMENTS_TITLE_FONT;
	ctx.fillStyle = COMPLIMENTS_TITLE_COLOR;
	ctx.fillText(title, x, y);
}

function drawGottenCopmliments(compliments) {
	var generalComplimentsTextYPosition = GENERAL_COMPLIMENTS_Y_START;
	var lookComplimentsTextYPosition = LOOK_COMPLIMENTS_Y_START;
	for (var complimentPosition = 0; complimentPosition < compliments.length; complimentPosition++) {
		var x;
		var y;
		if (compliments[complimentPosition].type === GENERAL_COMPLIMENT_TYPE) {
			x = GENERAL_COMPLIMENT_TEXT_X_POSITION;
			y = generalComplimentsTextYPosition;
			generalComplimentsTextYPosition += COMPLIMENT_TEXT_Y_DIFF;
		} else {
			x = LOOK_COMPLIMENT_TEXT_X_POSITION;
			y = lookComplimentsTextYPosition;
			lookComplimentsTextYPosition += COMPLIMENT_TEXT_Y_DIFF;
		}
		drawGottenCompliment(compliments[complimentPosition].text.text, x, y);
	}
}

function drawGottenCompliment(compliment, x, y) {
	ctx.font = UI_FONT;
	ctx.fillStyle = compliment.color;
	ctx.fillText(compliment, x, y);
}

draw();