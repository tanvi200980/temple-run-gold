/* ==========================================================================
   TEMPLE RUN - MAIN GAME ENGINE & CONTROLLER
   ========================================================================== */

import { sound } from './audio.js';
import { Player } from './player.js';
import { WorldManager } from './world.js';
import { ObstacleManager, POWERUP_TYPES } from './obstacles.js';

const STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
};

class GameApp {
  constructor() {
    this.state = STATES.MENU;
    
    // Core Gameplay metrics
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('temple_gold_highscore') || '0', 10);
    this.coins = 0;
    this.distance = 0;
    this.speed = 14.0;
    this.baseSpeed = 14.0;
    this.maxSpeed = 32.0;
    this.scoreMultiplier = 1;

    // Powerup Timers
    this.powerupActive = null;
    this.powerupTimer = 0;
    this.powerupDuration = 8.0;

    // Setup Three.js Renderer & Scene
    this.initThree();

    // Instantiate Subsystems
    this.player = new Player(this.scene);
    this.world = new WorldManager(this.scene);
    this.obstacles = new ObstacleManager(this.scene);

    // Setup UI & Controls
    this.initUI();
    this.initControls();
    this.initMenuParticles();

    // Clock
    this.clock = new THREE.Clock();

    // Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.container = document.getElementById('game-container');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070709);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    // Camera position for third-person follow view
    this.camera.position.set(0, 3.2, 5.0);
    this.camera.lookAt(0, 1.5, -5.0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initUI() {
    // Menu elements
    this.menuScreen = document.getElementById('main-menu');
    this.hudScreen = document.getElementById('hud-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');

    this.menuHighScoreEl = document.getElementById('menu-high-score');
    this.menuHighScoreEl.textContent = this.highScore.toLocaleString();

    // HUD elements
    this.hudScore = document.getElementById('hud-score');
    this.hudCoins = document.getElementById('hud-coins');
    this.hudDistance = document.getElementById('hud-distance');
    this.hudMultiplier = document.getElementById('hud-multiplier');

    // Powerup HUD
    this.powerupHud = document.getElementById('powerup-hud');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupBar = document.getElementById('powerup-progress-bar');

    // Game Over stats
    this.goScore = document.getElementById('go-score');
    this.goDistance = document.getElementById('go-distance');
    this.goCoins = document.getElementById('go-coins');
    this.goHighScore = document.getElementById('go-high-score');
    this.newRecordBanner = document.getElementById('new-record-banner');

    // Buttons
    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart').addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart-pause').addEventListener('click', () => this.startGame());
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit').addEventListener('click', () => this.showMenu());
    document.getElementById('btn-menu-from-go').addEventListener('click', () => this.showMenu());

    // Audio Toggle
    const audioBtn = document.getElementById('btn-audio-toggle');
    audioBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      document.getElementById('audio-icon').textContent = isMuted ? '🔇' : '🔊';
      audioBtn.classList.toggle('muted', isMuted);
    });
  }

  initControls() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (this.state !== STATES.PLAYING) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.player.moveLeft();
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          this.player.moveRight();
          break;

        case 'ArrowUp':
        case 'w':
        case 'W':
          this.player.jump();
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          this.player.slide();
          break;

        case 'Escape':
        case 'p':
        case 'P':
          this.pauseGame();
          break;
      }
    });

    // Touch Swipe Inputs for Mobile
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.state !== STATES.PLAYING) return;
      if (e.changedTouches.length === 0) return;

      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;

      const threshold = 35; // Swipe sensitivity threshold

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal Swipe
        if (diffX > threshold) this.player.moveRight();
        else if (diffX < -threshold) this.player.moveLeft();
      } else {
        // Vertical Swipe
        if (diffY < -threshold) this.player.jump();
        else if (diffY > threshold) this.player.slide();
      }
    }, { passive: true });
  }

  initMenuParticles() {
    // Canvas background floating gold dust particles for Main Menu screen
    const pCanvas = document.getElementById('menu-particles');
    const pCtx = pCanvas.getContext('2d');

    const resizeCanvas = () => {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        radius: Math.random() * 2.5 + 0.5,
        speedY: -Math.random() * 0.8 - 0.2,
        opacity: Math.random() * 0.7 + 0.3
      });
    }

    const drawParticles = () => {
      if (this.state === STATES.MENU) {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        pCtx.fillStyle = '#ffd700';

        particles.forEach(p => {
          p.y += p.speedY;
          if (p.y < 0) p.y = pCanvas.height;

          pCtx.globalAlpha = p.opacity;
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          pCtx.fill();
        });
      }
      requestAnimationFrame(drawParticles);
    };
    drawParticles();
  }

  showMenu() {
    this.state = STATES.MENU;
    this.hideAllScreens();
    this.menuScreen.classList.add('active');
    this.menuHighScoreEl.textContent = this.highScore.toLocaleString();
    sound.stopBGM();
  }

  startGame() {
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.speed = this.baseSpeed;
    this.scoreMultiplier = 1;
    this.powerupActive = null;
    this.powerupTimer = 0;

    this.player.reset();
    this.world.reset();
    this.obstacles.reset();

    this.updateHUD();

    this.state = STATES.PLAYING;
    this.hideAllScreens();
    this.hudScreen.classList.add('active');

    sound.startBGM();
  }

  pauseGame() {
    if (this.state === STATES.PLAYING) {
      this.state = STATES.PAUSED;
      this.pauseScreen.classList.add('active');
    }
  }

  resumeGame() {
    if (this.state === STATES.PAUSED) {
      this.pauseScreen.classList.remove('active');
      this.state = STATES.PLAYING;
    }
  }

  gameOver() {
    this.state = STATES.GAMEOVER;
    sound.playHitSound();
    sound.stopBGM();

    let isNewRecord = false;
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('temple_gold_highscore', this.highScore.toString());
      isNewRecord = true;
    }

    // Populate Game Over stats
    this.goScore.textContent = Math.floor(this.score).toLocaleString();
    this.goDistance.textContent = `${Math.floor(this.distance)} m`;
    this.goCoins.textContent = this.coins.toLocaleString();
    this.goHighScore.textContent = this.highScore.toLocaleString();

    if (isNewRecord) {
      this.newRecordBanner.classList.remove('hidden');
    } else {
      this.newRecordBanner.classList.add('hidden');
    }

    setTimeout(() => {
      this.hideAllScreens();
      this.gameOverScreen.classList.add('active');
    }, 600);
  }

  hideAllScreens() {
    this.menuScreen.classList.remove('active');
    this.hudScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.gameOverScreen.classList.remove('active');
  }

  activatePowerup(type) {
    this.powerupActive = type;
    this.powerupTimer = this.powerupDuration;
    sound.playPowerupSound();

    if (type === POWERUP_TYPES.SHIELD) {
      this.player.hasShield = true;
    } else if (type === POWERUP_TYPES.MAGNET) {
      this.player.hasMagnet = true;
    } else if (type === POWERUP_TYPES.MULTIPLIER) {
      this.scoreMultiplier = 2;
      this.player.hasMultiplier = true;
    }

    this.powerupHud.classList.remove('hidden');
    this.powerupName.textContent = `${type.toUpperCase()} ACTIVE`;
  }

  updatePowerups(dt) {
    if (this.powerupActive) {
      this.powerupTimer -= dt;
      const progressPct = (this.powerupTimer / this.powerupDuration) * 100;
      this.powerupBar.style.width = `${Math.max(0, progressPct)}%`;

      if (this.powerupTimer <= 0) {
        // Expire Powerup
        this.player.hasShield = false;
        this.player.hasMagnet = false;
        this.player.hasMultiplier = false;
        this.scoreMultiplier = 1;
        this.powerupActive = null;
        this.powerupHud.classList.add('hidden');
      }
    }
  }

  checkCollisions() {
    // 1. Check Collectibles
    for (let i = 0; i < this.obstacles.collectibles.length; i++) {
      const item = this.obstacles.collectibles[i];
      if (!item.active) continue;

      // Distance check between player torso and collectible
      const dist = this.player.position.distanceTo(item.mesh.position);
      if (dist < 1.4) {
        item.active = false;

        if (item.type === POWERUP_TYPES.COIN) {
          this.coins += 1;
          this.score += 25 * this.scoreMultiplier;
          sound.playCoinSound();
        } else {
          this.activatePowerup(item.type);
        }
      }
    }

    // 2. Check Obstacles
    const playerBox = this.player.box;

    for (let i = 0; i < this.obstacles.obstacles.length; i++) {
      const obs = this.obstacles.obstacles[i];

      if (playerBox.intersectsBox(obs.box)) {
        // Handle Shield Defense
        if (this.player.hasShield) {
          this.player.hasShield = false;
          this.powerupActive = null;
          this.powerupHud.classList.add('hidden');
          sound.playHitSound();
          // Destroy obstacle
          this.scene.remove(obs.mesh);
          this.obstacles.obstacles.splice(i, 1);
          return;
        }

        // Check if slide safely avoids low beam
        if (obs.type === 'low_beam' && this.player.isSliding) {
          continue; // Safe slide under beam
        }

        // Crash Collision -> Game Over
        this.gameOver();
        break;
      }
    }
  }

  updateHUD() {
    this.hudScore.textContent = Math.floor(this.score).toLocaleString();
    this.hudCoins.textContent = this.coins.toLocaleString();
    this.hudDistance.textContent = Math.floor(this.distance).toString();
    this.hudMultiplier.textContent = `${this.scoreMultiplier}X`;
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === STATES.PLAYING) {
      // Speed acceleration over time
      this.speed = Math.min(this.speed + dt * 0.15, this.maxSpeed);

      // Distance & Score accrual
      this.distance += this.speed * dt * 0.8;
      this.score += this.speed * dt * 10 * this.scoreMultiplier;

      // Update Systems
      this.player.update(dt, this.speed);
      this.world.update(dt, this.speed);
      this.obstacles.update(dt, this.player, this.speed);

      // Powerups & Collisions
      this.updatePowerups(dt);
      this.checkCollisions();

      // Update HUD UI
      this.updateHUD();

      // Dynamic Camera Position follow
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.player.position.x * 0.4, 0.1);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 3.2 + this.player.position.y * 0.3, 0.1);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
