import { Alien } from './entities/alien';
import { Bullet } from './entities/bullet';
import { Explosion } from './entities/explosion';
import { Player } from './entities/player';
import { SoundService } from './service/sound-service';
import './style.css';

let player: Player;
let bullets: Bullet[] = [];
let aliens: Alien[] = [];
let lastTime = -1;
let aliensPerSpawn = 1;
let intialSpawnIntervalInSeconds = 5;
let spawnIntervalInSeconds = 5;
let lastSpawnTime = 0;
let numberOfAliensDestroyed = 0;
let numberOfAliensMissed = 0;
let gameTimeInSeconds: number = 0;
let explosions: Explosion[] = [];
let aliensSpawnAreaWidth = 800;
let isGameStarted = false;
let isGameOver = false;

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
  context.fillRect(0, 0, canvas.width, canvas.height);

  player = new Player(canvas.width / 2, canvas.height - 50, 50, 50, 'blue', 300);
  player.draw(context);
  aliensSpawnAreaWidth = Math.min(aliensSpawnAreaWidth, canvas.width);
  let alienX = Date.now() % (canvas.width - 50);
  console.log(alienX);
  let alien = new Alien(alienX, 0, 50, 50, 'green', 100);
  aliens.push(alien);
}

window.onload = () => {
  setupCanvas();
};
let initiatedDeviceOrientation = false;

document.addEventListener('touchstart', () => {
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
    if (gamma < 5) {
      player.currentSpeed = -1 * Math.abs(player.speed);
    } else if (gamma > 5) {
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
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
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
      let alienX = spawnAreaStartX + Math.floor(Date.now() * Math.random()) % (aliensSpawnAreaWidth);
      let alien = new Alien(alienX, 0, 50, 50, 'green', 100);
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
  SoundService.getInstance().getSound('/assets/sounds/laser-gun-shot.mp3').then((explosionSound) => {
    const shootSoundClone = explosionSound?.cloneNode() as HTMLAudioElement;
    shootSoundClone.play();
});
}

function playExplosionSound() {
  SoundService.getInstance().getSound('/assets/sounds/alien-explosion.mp3').then((explosionSound) => {
    const explosionSoundClone = explosionSound?.cloneNode(true) as HTMLAudioElement;
    explosionSoundClone.play();
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


function startGame(event: PointerEvent) {
  let gameStartButton = document.getElementById('game-start-button'); 
  if (isGameStarted) return;
  isGameStarted = true;
  if (gameStartButton) {
    gameStartButton.style.display = 'none';
  }
  showCanvas();
  if (event.pointerType === 'touch') {
    addDeviceOrientationListener();
  }
  requestAnimationFrame(gameLoop);
}

function showCanvas() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  canvas.style.display = 'block';
}
(window as any).startGame = startGame;