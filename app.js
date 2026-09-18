/* ==========================================================================
   TEMPLE RUN: OBSIDIAN & GOLD EDITION - ALL-IN-ONE ENGINE
   ========================================================================== */

// --- 1. SOUND ENGINE ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmTimer = null;
    this.isPlayingBGM = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.muted;
  }

  playCoinSound() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playJumpSound() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playSlideSound() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPowerupSound() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.15);
    });
  }

  playHitSound() {
    if (this.muted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  startBGM() {
    if (this.muted || this.isPlayingBGM) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingBGM = true;
    let step = 0;
    const tempoMs = 220;

    const playBeat = () => {
      if (!this.isPlayingBGM || this.muted) return;
      const now = this.ctx.currentTime;

      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(110, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        kickGain.gain.setValueAtTime(0.25, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        kick.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kick.start(now);
        kick.stop(now + 0.12);
      }

      if (step % 2 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3000, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }

      step = (step + 1) % 16;
      this.bgmTimer = setTimeout(playBeat, tempoMs);
    };

    playBeat();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

const sound = new SoundEngine();

// --- 2. PLAYER CONTROLLER ---
const LANE_WIDTH = 2.4;
const LANES = { LEFT: -1, CENTER: 0, RIGHT: 1 };

class Player {
  constructor(scene) {
    this.scene = scene;
    this.currentLane = LANES.CENTER;
    this.targetX = 0;
    this.position = new THREE.Vector3(0, 0, 0);

    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = -38.0;
    this.jumpImpulse = 13.5;

    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.75;

    this.hasShield = false;
    this.hasMagnet = false;
    this.hasMultiplier = false;

    this.animTime = 0;
    this.box = new THREE.Box3();

    this.createMesh();
    this.createShieldAura();
    this.createParticleTrail();
  }

  createMesh() {
    this.group = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2
    });

    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      metalness: 0.5,
      roughness: 0.4
    });

    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, goldMat);
    this.torso.position.y = 1.1;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    const emblemGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
    const emblemMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, 0.1, 0.22);
    this.torso.add(emblem);

    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    this.head = new THREE.Mesh(headGeo, obsidianMat);
    this.head.position.y = 0.75;
    this.head.castShadow = true;
    this.torso.add(this.head);

    const visorGeo = new THREE.BoxGeometry(0.38, 0.1, 0.1);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.21);
    this.head.add(visor);

    const limbGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);

    this.leftArm = new THREE.Mesh(limbGeo, obsidianMat);
    this.leftArm.position.set(-0.48, 0.2, 0);
    this.leftArm.geometry.translate(0, -0.3, 0);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Mesh(limbGeo, obsidianMat);
    this.rightArm.position.set(0.48, 0.2, 0);
    this.rightArm.geometry.translate(0, -0.3, 0);
    this.torso.add(this.rightArm);

    this.leftLeg = new THREE.Mesh(limbGeo, goldMat);
    this.leftLeg.position.set(-0.22, -0.45, 0);
    this.leftLeg.geometry.translate(0, -0.3, 0);
    this.torso.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(limbGeo, goldMat);
    this.rightLeg.position.set(0.22, -0.45, 0);
    this.rightLeg.geometry.translate(0, -0.3, 0);
    this.torso.add(this.rightLeg);

    this.scene.add(this.group);
  }

  createShieldAura() {
    const shieldGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);
  }

  createParticleTrail() {
    this.particleCount = 40;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = Math.random() * 0.4;
      positions[i * 3 + 2] = Math.random() * -2.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.trailParticles = new THREE.Points(geo, mat);
    this.group.add(this.trailParticles);
  }

  moveLeft() {
    if (this.currentLane > LANES.LEFT) {
      this.currentLane--;
      this.targetX = this.currentLane * LANE_WIDTH;
      sound.playSlideSound();
    }
  }

  moveRight() {
    if (this.currentLane < LANES.RIGHT) {
      this.currentLane++;
      this.targetX = this.currentLane * LANE_WIDTH;
      sound.playSlideSound();
    }
  }

  jump() {
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpImpulse;
      sound.playJumpSound();
    }
  }

  slide() {
    if (!this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      sound.playSlideSound();
    }
  }

  update(dt, gameSpeed) {
    this.animTime += dt * gameSpeed * 0.85;

    this.position.x += (this.targetX - this.position.x) * 15 * dt;

    const tilt = (this.targetX - this.position.x) * -0.2;
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, tilt, 0.15);

    if (this.isJumping) {
      this.position.y += this.jumpVelocity * dt;
      this.jumpVelocity += this.gravity * dt;

      if (this.position.y <= 0) {
        this.position.y = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    this.group.position.copy(this.position);

    this.animateLimbs(dt);
    this.updateParticles(dt);

    this.shieldMesh.visible = this.hasShield;
    if (this.hasShield) {
      this.shieldMesh.rotation.y += dt * 2.0;
    }

    this.updateBoundingBox();
  }

  animateLimbs(dt) {
    if (this.isSliding) {
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -Math.PI / 3, 0.2);
      this.torso.position.y = 0.5;
      this.leftArm.rotation.x = -Math.PI / 4;
      this.rightArm.rotation.x = -Math.PI / 4;
      this.leftLeg.rotation.x = Math.PI / 4;
      this.rightLeg.rotation.x = Math.PI / 4;
    } else if (this.isJumping) {
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.1, 0.2);
      this.torso.position.y = 1.1;
      this.leftArm.rotation.x = -Math.PI * 0.7;
      this.rightArm.rotation.x = -Math.PI * 0.7;
      this.leftLeg.rotation.x = Math.PI * 0.3;
      this.rightLeg.rotation.x = -Math.PI * 0.2;
    } else {
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.1, 0.2);
      this.torso.position.y = 1.1 + Math.sin(this.animTime * 2) * 0.08;

      const swing = Math.sin(this.animTime) * 0.8;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing;
      this.rightLeg.rotation.x = swing;
    }
  }

  updateParticles(dt) {
    const pos = this.trailParticles.geometry.attributes.position.array;
    for (let i = 0; i < this.particleCount; i++) {
      pos[i * 3 + 2] -= dt * 6.0;
      if (pos[i * 3 + 2] < -3.0) {
        pos[i * 3 + 2] = 0;
        pos[i * 3] = (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 1] = Math.random() * 0.4;
      }
    }
    this.trailParticles.geometry.attributes.position.needsUpdate = true;
  }

  updateBoundingBox() {
    let minY = this.position.y;
    let maxY = this.position.y + (this.isSliding ? 0.7 : 1.7);
    
    this.box.set(
      new THREE.Vector3(this.position.x - 0.35, minY, this.position.z - 0.4),
      new THREE.Vector3(this.position.x + 0.35, maxY, this.position.z + 0.4)
    );
  }

  reset() {
    this.currentLane = LANES.CENTER;
    this.targetX = 0;
    this.position.set(0, 0, 0);
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.isJumping = false;
    this.isSliding = false;
    this.jumpVelocity = 0;
    this.hasShield = false;
    this.hasMagnet = false;
    this.hasMultiplier = false;
  }
}

// --- 3. WORLD MANAGER ---
const TILE_LENGTH = 16;
const TOTAL_TILES = 12;

class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.tiles = [];

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0f0f14,
      roughness: 0.4,
      metalness: 0.6
    });

    this.goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.25,
      metalness: 0.95
    });

    this.runeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    this.setupLighting();
    this.initTiles();
  }

  setupLighting() {
    this.scene.fog = new THREE.FogExp2(0x070709, 0.018);

    const ambientLight = new THREE.AmbientLight(0xffe899, 0.6);
    this.scene.add(ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff2a3, 1.4);
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);

    this.playerLight = new THREE.PointLight(0xffd700, 1.2, 25);
    this.playerLight.position.set(0, 4, 2);
    this.scene.add(this.playerLight);
  }

  initTiles() {
    for (let i = 0; i < TOTAL_TILES; i++) {
      const tile = this.createTileMesh();
      tile.position.z = -i * TILE_LENGTH;
      this.scene.add(tile);
      this.tiles.push(tile);
    }
  }

  createTileMesh() {
    const tileGroup = new THREE.Group();

    const floorGeo = new THREE.BoxGeometry(8.5, 0.4, TILE_LENGTH);
    const floor = new THREE.Mesh(floorGeo, this.obsidianMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    tileGroup.add(floor);

    const curbGeo = new THREE.BoxGeometry(0.5, 0.6, TILE_LENGTH);
    
    const leftCurb = new THREE.Mesh(curbGeo, this.goldTrimMat);
    leftCurb.position.set(-4.25, 0.1, 0);
    tileGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, this.goldTrimMat);
    rightCurb.position.set(4.25, 0.1, 0);
    tileGroup.add(rightCurb);

    const lineGeo = new THREE.BoxGeometry(7.6, 0.05, 0.3);
    for (let z = -TILE_LENGTH / 2 + 2; z < TILE_LENGTH / 2; z += 4) {
      const line = new THREE.Mesh(lineGeo, this.goldTrimMat);
      line.position.set(0, 0.02, z);
      tileGroup.add(line);
    }

    this.addPillars(tileGroup);
    return tileGroup;
  }

  addPillars(tileGroup) {
    const pillarGeo = new THREE.BoxGeometry(0.9, 5.0, 0.9);
    const capitalGeo = new THREE.BoxGeometry(1.2, 0.4, 1.2);

    [-5.2, 5.2].forEach(x => {
      for (let z = -TILE_LENGTH / 2 + 4; z < TILE_LENGTH / 2; z += 8) {
        const pillar = new THREE.Mesh(pillarGeo, this.obsidianMat);
        pillar.position.set(x, 2.5, z);
        pillar.castShadow = true;
        tileGroup.add(pillar);

        const cap = new THREE.Mesh(capitalGeo, this.goldTrimMat);
        cap.position.set(x, 4.8, z);
        tileGroup.add(cap);

        const runeGeo = new THREE.BoxGeometry(0.92, 0.6, 0.1);
        const rune = new THREE.Mesh(runeGeo, this.runeMat);
        rune.position.set(x > 0 ? x - 0.42 : x + 0.42, 2.5, z);
        rune.rotation.y = Math.PI / 2;
        tileGroup.add(rune);
      }
    });
  }

  update(dt, currentSpeed) {
    const moveDistance = currentSpeed * dt;

    this.tiles.forEach(tile => {
      tile.position.z += moveDistance;
    });

    const firstTile = this.tiles[0];
    if (firstTile.position.z > TILE_LENGTH) {
      this.tiles.shift();
      const lastTileZ = this.tiles[this.tiles.length - 1].position.z;
      firstTile.position.z = lastTileZ - TILE_LENGTH;
      this.tiles.push(firstTile);
    }
  }

  reset() {
    for (let i = 0; i < TOTAL_TILES; i++) {
      this.tiles[i].position.z = -i * TILE_LENGTH;
    }
  }
}

// --- 4. OBSTACLES & POWERUPS ---
const OBSTACLE_TYPES = {
  PILLAR: 'pillar',
  LOW_BEAM: 'low_beam',
  HIGH_BARRIER: 'barrier'
};

const POWERUP_TYPES = {
  COIN: 'coin',
  MAGNET: 'magnet',
  SHIELD: 'shield',
  MULTIPLIER: 'multiplier'
};

class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.collectibles = [];
    this.initAssets();
    this.lastSpawnZ = 0;
    this.minSpawnInterval = 18;
  }

  initAssets() {
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2
    });

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      metalness: 0.4,
      roughness: 0.3
    });

    this.laserMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });

    this.cyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x0088cc,
      metalness: 0.8
    });

    this.amberMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xcc2200,
      metalness: 0.8
    });

    this.coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    this.coinGeo.rotateX(Math.PI / 2);
  }

  spawnPattern(playerZ) {
    const spawnZ = playerZ - 80;
    const r = Math.random();
    const laneKeys = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];

    if (r < 0.45) {
      const chosenLane = laneKeys[Math.floor(Math.random() * laneKeys.length)];
      this.createPillar(chosenLane, spawnZ);
      laneKeys.filter(l => l !== chosenLane).forEach(l => {
        if (Math.random() < 0.5) this.spawnCoinLine(l, spawnZ - 10, 5);
      });
    } else if (r < 0.7) {
      this.createLowBeam(spawnZ);
      this.spawnCoinLine(LANES.CENTER, spawnZ, 4, 0.4);
    } else {
      const chosenLane = laneKeys[Math.floor(Math.random() * laneKeys.length)];
      this.createHighBarrier(chosenLane, spawnZ);
      this.spawnCoinLine(chosenLane, spawnZ - 4, 4, 1.6);
    }

    if (Math.random() < 0.25) {
      const pLane = laneKeys[Math.floor(Math.random() * laneKeys.length)];
      const pTypes = [POWERUP_TYPES.MAGNET, POWERUP_TYPES.SHIELD, POWERUP_TYPES.MULTIPLIER];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      this.createPowerup(pType, pLane, spawnZ - 15);
    }
  }

  createPillar(lane, z) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.4, 3.2, 0.8);
    const mesh = new THREE.Mesh(geo, this.obsidianMat);
    mesh.position.y = 1.6;
    mesh.castShadow = true;
    group.add(mesh);

    const trimGeo = new THREE.BoxGeometry(1.45, 0.3, 0.85);
    const trim = new THREE.Mesh(trimGeo, this.goldMat);
    trim.position.y = 2.8;
    group.add(trim);

    group.position.set(lane * LANE_WIDTH, 0, z);

    const box = new THREE.Box3();
    box.setFromObject(group);

    this.obstacles.push({
      type: OBSTACLE_TYPES.PILLAR,
      mesh: group,
      box: box,
      z: z
    });

    this.scene.add(group);
  }

  createLowBeam(z) {
    const group = new THREE.Group();
    const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 3.2, 0.8, 0.5);
    const beam = new THREE.Mesh(beamGeo, this.obsidianMat);
    beam.position.y = 1.6;
    group.add(beam);

    const laser = new THREE.Mesh(new THREE.BoxGeometry(LANE_WIDTH * 3.2, 0.15, 0.55), this.laserMat);
    laser.position.y = 1.2;
    group.add(laser);

    group.position.set(0, 0, z);

    const box = new THREE.Box3(
      new THREE.Vector3(-LANE_WIDTH * 1.6, 1.1, z - 0.3),
      new THREE.Vector3(LANE_WIDTH * 1.6, 2.2, z + 0.3)
    );

    this.obstacles.push({
      type: OBSTACLE_TYPES.LOW_BEAM,
      mesh: group,
      box: box,
      z: z
    });

    this.scene.add(group);
  }

  createHighBarrier(lane, z) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.8, 0.7, 0.6);
    const mesh = new THREE.Mesh(geo, this.goldMat);
    mesh.position.y = 0.35;
    group.add(mesh);

    group.position.set(lane * LANE_WIDTH, 0, z);

    const box = new THREE.Box3();
    box.setFromObject(group);

    this.obstacles.push({
      type: OBSTACLE_TYPES.HIGH_BARRIER,
      mesh: group,
      box: box,
      z: z
    });

    this.scene.add(group);
  }

  spawnCoinLine(lane, startZ, count = 5, height = 0.8) {
    for (let i = 0; i < count; i++) {
      const coinMesh = new THREE.Mesh(this.coinGeo, this.goldMat);
      const z = startZ - i * 2.2;
      coinMesh.position.set(lane * LANE_WIDTH, height, z);
      coinMesh.castShadow = true;

      this.collectibles.push({
        type: POWERUP_TYPES.COIN,
        mesh: coinMesh,
        active: true
      });

      this.scene.add(coinMesh);
    }
  }

  createPowerup(type, lane, z) {
    let mat = this.cyanMat;
    let geo = new THREE.OctahedronGeometry(0.5);

    if (type === POWERUP_TYPES.MAGNET) {
      mat = this.goldMat;
      geo = new THREE.TorusGeometry(0.4, 0.15, 8, 16);
    } else if (type === POWERUP_TYPES.MULTIPLIER) {
      mat = this.amberMat;
      geo = new THREE.IcosahedronGeometry(0.5);
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(lane * LANE_WIDTH, 1.2, z);

    this.collectibles.push({
      type: type,
      mesh: mesh,
      active: true
    });

    this.scene.add(mesh);
  }

  update(dt, player, currentSpeed) {
    const moveZ = currentSpeed * dt;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.mesh.position.z += moveZ;
      item.mesh.rotation.y += dt * 3.5;

      if (player.hasMagnet && item.type === POWERUP_TYPES.COIN && item.mesh.position.z > -25) {
        const pPos = player.position;
        item.mesh.position.lerp(new THREE.Vector3(pPos.x, pPos.y + 0.8, pPos.z), dt * 10.0);
      }

      if (item.mesh.position.z > 5 || !item.active) {
        this.scene.remove(item.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.mesh.position.z += moveZ;

      if (obs.type === OBSTACLE_TYPES.LOW_BEAM) {
        obs.box.min.z = obs.mesh.position.z - 0.3;
        obs.box.max.z = obs.mesh.position.z + 0.3;
      } else {
        obs.box.setFromObject(obs.mesh);
      }

      if (obs.mesh.position.z > 8) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    this.lastSpawnZ += moveZ;
    if (this.lastSpawnZ > this.minSpawnInterval) {
      this.spawnPattern(0);
      this.lastSpawnZ = 0;
    }
  }

  reset() {
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.collectibles.forEach(c => this.scene.remove(c.mesh));
    this.obstacles = [];
    this.collectibles = [];
    this.lastSpawnZ = 0;
  }
}

// --- 5. MAIN GAME ENGINE ---
const STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
};

class GameApp {
  constructor() {
    this.state = STATES.MENU;
    
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('temple_gold_highscore') || '0', 10);
    this.coins = 0;
    this.distance = 0;
    this.speed = 14.0;
    this.baseSpeed = 14.0;
    this.maxSpeed = 32.0;
    this.scoreMultiplier = 1;

    this.powerupActive = null;
    this.powerupTimer = 0;
    this.powerupDuration = 8.0;

    this.initThree();

    this.player = new Player(this.scene);
    this.world = new WorldManager(this.scene);
    this.obstacles = new ObstacleManager(this.scene);

    this.initUI();
    this.initControls();
    this.initMenuParticles();

    this.clock = new THREE.Clock();
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
    this.menuScreen = document.getElementById('main-menu');
    this.hudScreen = document.getElementById('hud-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');

    this.menuHighScoreEl = document.getElementById('menu-high-score');
    this.menuHighScoreEl.textContent = this.highScore.toLocaleString();

    this.hudScore = document.getElementById('hud-score');
    this.hudCoins = document.getElementById('hud-coins');
    this.hudDistance = document.getElementById('hud-distance');
    this.hudMultiplier = document.getElementById('hud-multiplier');

    this.powerupHud = document.getElementById('powerup-hud');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupBar = document.getElementById('powerup-progress-bar');

    this.goScore = document.getElementById('go-score');
    this.goDistance = document.getElementById('go-distance');
    this.goCoins = document.getElementById('go-coins');
    this.goHighScore = document.getElementById('go-high-score');
    this.newRecordBanner = document.getElementById('new-record-banner');

    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart').addEventListener('click', () => this.startGame());
    document.getElementById('btn-restart-pause').addEventListener('click', () => this.startGame());
    document.getElementById('btn-pause').addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-quit').addEventListener('click', () => this.showMenu());
    document.getElementById('btn-menu-from-go').addEventListener('click', () => this.showMenu());

    const audioBtn = document.getElementById('btn-audio-toggle');
    audioBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      document.getElementById('audio-icon').textContent = isMuted ? '🔇' : '🔊';
      audioBtn.classList.toggle('muted', isMuted);
    });
  }

  initControls() {
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
      const threshold = 35;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > threshold) this.player.moveRight();
        else if (diffX < -threshold) this.player.moveLeft();
      } else {
        if (diffY < -threshold) this.player.jump();
        else if (diffY > threshold) this.player.slide();
      }
    }, { passive: true });
  }

  initMenuParticles() {
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
    for (let i = 0; i < this.obstacles.collectibles.length; i++) {
      const item = this.obstacles.collectibles[i];
      if (!item.active) continue;

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

    const playerBox = this.player.box;

    for (let i = 0; i < this.obstacles.obstacles.length; i++) {
      const obs = this.obstacles.obstacles[i];

      if (playerBox.intersectsBox(obs.box)) {
        if (this.player.hasShield) {
          this.player.hasShield = false;
          this.powerupActive = null;
          this.powerupHud.classList.add('hidden');
          sound.playHitSound();
          this.scene.remove(obs.mesh);
          this.obstacles.obstacles.splice(i, 1);
          return;
        }

        if (obs.type === 'low_beam' && this.player.isSliding) {
          continue;
        }

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
      this.speed = Math.min(this.speed + dt * 0.15, this.maxSpeed);

      this.distance += this.speed * dt * 0.8;
      this.score += this.speed * dt * 10 * this.scoreMultiplier;

      this.player.update(dt, this.speed);
      this.world.update(dt, this.speed);
      this.obstacles.update(dt, this.player, this.speed);

      this.updatePowerups(dt);
      this.checkCollisions();

      this.updateHUD();

      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.player.position.x * 0.4, 0.1);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 3.2 + this.player.position.y * 0.3, 0.1);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
