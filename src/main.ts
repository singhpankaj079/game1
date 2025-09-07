import { Alien } from './entities/alien';
import { Bullet } from './entities/bullet';
import { Explosion } from './entities/explosion';
import { Player } from './entities/player';
import { Star } from './entities/star';
import { SoundService } from './service/sound-service';
import './style.css';

let player: Player;
let bullets: Bullet[] = [];
let aliens: Alien[] = [];
let stars: Star[] = [];
let lastTime = -1;
let aliensPerSpawn = 1;
let intialSpawnIntervalInSeconds = 5;
let spawnIntervalInSeconds = 5;
let lastSpawnTime = 0;
let numberOfAliensDestroyed = 0;
let numberOfAliensMissed = 0;
let gameTimeInSeconds: number = 0;
let explosions: Explosion[] = [];
let aliensSpawnAreaWidth: number;
let alienWidth: number;
let alienHeight: number;
let alienSpeed: number;
let playerWidth: number;
let playerHeight: number;
let playerSpeed: number;
let numberOfStars: number = 20;
// let playerBulletSpeed: number;
let isGameStarted = false;
let isGameOver = false;
let isMobile = false;
// @ts-ignore
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function setupCanvas() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Failed to get 2D context!');
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.fillStyle = 'black';
  context.clearRect(0, 0, canvas.width, canvas.height);
  initializeStars(context);
  playerWidth = 50;
  playerHeight = playerWidth;
  playerSpeed = (canvas.width / 4);
  player = new Player(canvas.width / 2, canvas.height - playerHeight, playerWidth, playerHeight, 'blue', playerSpeed);
  player.draw(context);
  aliensSpawnAreaWidth = canvas.width;
  alienWidth = 50;
  alienHeight = alienWidth;
  alienSpeed = canvas.height / 20;
  // playerBulletSpeed = alienSpeed * 2;
  let alienX = Date.now() % (canvas.width / 2);
  let alien = new Alien(alienX, 0, alienWidth, alienHeight, 'green', alienSpeed);
  aliens.push(alien);
}

window.onload = () => {
  setupCanvas();
};
let initiatedDeviceOrientation = false;

document.addEventListener('touchstart', () => {
  isMobile = true;
  if (isGameStarted && !isGameOver) {
    bullets.push(new Bullet(player.x, player.y - player.height / 3 * 2, 0, -500, 5, 'yellow'));
    playShootSound();
  }
});

function addDeviceOrientationListener() {
  if (initiatedDeviceOrientation) return;
  // @ts-ignore
  if (typeof window.DeviceOrientationEvent['requestPermission'] === 'function') {
    (window.DeviceOrientationEvent as any)?.requestPermission()
      // @ts-ignore
      .then(permissionState => {
        if (permissionState === 'granted') {
          initiatedDeviceOrientation = true;
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          alert("Permission denied.");
        }
      })
      //@ts-ignore
      .catch(err => console.error("Permission error 123:", err));
  } else {
    // Non-iOS browsers
    window.addEventListener('deviceorientation', handleOrientation);
    initiatedDeviceOrientation = true;
  }
}

function handleOrientation(event: DeviceOrientationEvent) {
  const gamma = event.gamma ?? 0;;
  if (gamma < -2) {
    player.currentSpeed = -1 * Math.abs(player.speed);
  } else if (gamma > 2) {
    player.currentSpeed = Math.abs(player.speed);
  } else {
    player.currentSpeed = 0;
  }
}

document.addEventListener('keydown', (event) => {
  if (!player) return;

  switch (event.key) {
    case 'ArrowLeft':
      player.currentSpeed = -1 * Math.abs(player.speed);
      break;
    case 'ArrowRight':
      player.currentSpeed = Math.abs(player.speed);
      break;
    case ' ':
    case 'Spacebar':
    case 'ArrowUp':
      bullets.push(new Bullet(player.x, player.y - player.height / 3 * 2, 0, -500, 5, 'yellow'));
      playShootSound();
      break;
  }
});

document.addEventListener('keyup', (event) => {
  if (!player) return;

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      player.currentSpeed = 0;
      break;
  }
});

function gameLoop(time: number) {
  if (checkGameOver()) {
    return;
  }
  gameTimeInSeconds = Number(((1 + time) / 1000).toFixed(2));
  spawnIntervalInSeconds = Math.max(intialSpawnIntervalInSeconds - gameTimeInSeconds / 10, 1)
  if (lastTime == -1) {
    lastTime = time;
    requestAnimationFrame(gameLoop);
    return;
  }
  let deltaTime = time - lastTime;
  lastTime = time;
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  updateStars(deltaTime, context);
  player.update(deltaTime, context);
  player.draw(context);
  bullets.forEach((bullet) => {
    bullet.update(deltaTime);
    bullet.draw(context);
  });
  bullets = bullets.filter((bullet) => bullet.y + bullet.length > 0);
  updateAliens(deltaTime, context);
  requestAnimationFrame(gameLoop);
  context.fillStyle = 'white';
  context.font = '20px Arial';
  context.fillText(`Kills: ${numberOfAliensDestroyed}`, 10, 30);
  context.fillText(`Missed: ${numberOfAliensMissed}`, 10, 60);
  context.fillText(`Time: ${gameTimeInSeconds.toFixed(0)} s`, 10, 90);
}

function updateAliens(deltaTime: number, context: CanvasRenderingContext2D) {
  aliens.forEach((alien) => {
    alien.update(deltaTime);
  });
  if (lastTime - lastSpawnTime > spawnIntervalInSeconds * 1000) {
    lastSpawnTime = lastTime;
    const spawnAreaStartX = Math.max(0, (context.canvas.width - aliensSpawnAreaWidth) / 2);
    for (let i = 0; i < aliensPerSpawn; i++) {
      let alienX = spawnAreaStartX + Math.floor(Date.now() * Math.random()) % (aliensSpawnAreaWidth - alienWidth);
      let alien = new Alien(alienX, 0, alienWidth, alienHeight, 'green', alienSpeed);
      aliens.push(alien);
    }
  }
  let initialAlienCount = aliens.length;
  aliens = aliens.filter((alien) => alien.y < context.canvas.height);
  numberOfAliensMissed += initialAlienCount - aliens.length;
  let removedAliens: Alien[] = [];
  aliens.forEach((alien) => {
    let removedBullets: Bullet[] = [];
    bullets.forEach((bullet) => {
      if (
        bullet.x >= alien.x &&
        bullet.x <= alien.x + alien.width &&
        bullet.y <= alien.y + alien.height &&
        bullet.y > alien.y
      ) {
        removedAliens.push(alien);
        removedBullets.push(bullet);
        numberOfAliensDestroyed += 1;
        playExplosionSound();
        explosions.push(new Explosion(alien.x, alien.y, alien.width, alien.height, gameTimeInSeconds * 1000 + 100));
        return;
      }
    });
    bullets = bullets.filter((bullet) => !removedBullets.includes(bullet));
    removedBullets = []
  });
  aliens = aliens.filter((alien) => !removedAliens.includes(alien));
  explosions = explosions.filter((explosion) => explosion.shouldDisplay);
  explosions.forEach((explosion) => {
    explosion.update(gameTimeInSeconds * 1000);
    explosion.draw(context);
  });
  removedAliens = [];
  aliens.forEach((alien) => {
    alien.draw(context);
  });
}

function playShootSound() {
  SoundService.getInstance(audioContext).getAudioBufferSource(import.meta.env.BASE_URL + '/assets/sounds/laser-gun-shot.wav').then((shootSoundBufferSource) => {
    shootSoundBufferSource?.start();
  });
}

function playExplosionSound() {
  SoundService.getInstance(audioContext).getAudioBufferSource(import.meta.env.BASE_URL + 'assets/sounds/alien-explosion.wav').then((explosionSoundBufferSource) => {
    explosionSoundBufferSource?.start();
  });
}

function checkGameOver() {
  if (isGameOver) return true;
  aliens.forEach((alien) => {
    if (alien.y + alien.height >= player.y - player.height / 3 * 2 && (alien.x + alien.width >= player.x - player.width / 2 && alien.x <= player.x + player.width / 2)) {
      isGameOver = true;
      return;
    }
  });
  isGameOver = isGameOver || numberOfAliensMissed >= 10;
  if (isGameOver) {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '50px Arial';
    context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    context.font = '30px Arial';
    context.fillText(`Kills: ${numberOfAliensDestroyed}`, canvas.width / 2 - 70, canvas.height / 2 + 50);
    context.fillText(`Missed: ${numberOfAliensMissed}`, canvas.width / 2 - 70, canvas.height / 2 + 90);
    context.fillText(`Time: ${gameTimeInSeconds.toFixed(0)} s`, canvas.width / 2 - 70, canvas.height / 2 + 130);
  }
  return isGameOver;
}


function startGame() {
  let gameStartButton = document.getElementById('game-start-button');
  if (isGameStarted) return;
  isGameStarted = true;
  if (gameStartButton) {
    gameStartButton.style.display = 'none';
  }
  showCanvas();
  isMobile = isMobile || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    addDeviceOrientationListener();
  }
  requestAnimationFrame(gameLoop);
}

function initializeStars(context: CanvasRenderingContext2D) {
  let canvasWidth = context.canvas.width;
  let canvasHeight = context.canvas.height;
  let dateNow = Date.now();
  for (let i=0;i< numberOfStars;i++) {
    let starX = Math.floor(dateNow * Math.random()) % canvasWidth;
    let startY = Math.floor(dateNow * Math.random()) % canvasHeight;
    let radius1 = 1 + dateNow % 3;
    let radius2 = 2 + dateNow % 3;
    stars.push(new Star(starX, startY, radius1, radius2, 10 + dateNow % 10));
  }
}

function updateStars(deltaTime: number, context: CanvasRenderingContext2D) {
  let canvasWidth = context.canvas.width;
  stars.forEach((star) => {
    star.update(deltaTime);
  });
  stars = stars.filter(star => star.y < context.canvas.height);
  if (stars.length < numberOfStars) {
    let dateNow = Date.now();
    let radius1 = 1 + dateNow % 3;
    let radius2 = 2 + dateNow % 3;
    stars.push(new Star(Math.floor(dateNow * Math.random()) % canvasWidth, 0, radius1, radius2, 10 + dateNow % 10))
  }
  stars.forEach(star => star.drawStar(lastTime, context));
}

function showCanvas() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  canvas.style.display = 'block';
}
SoundService.getInstance(audioContext).loadSoundPool(import.meta.env.BASE_URL + 'assets/sounds/laser-gun-shot.wav');
SoundService.getInstance(audioContext).loadSoundPool(import.meta.env.BASE_URL + 'assets/sounds/alien-explosion.wav');
(window as any).startGame = startGame;