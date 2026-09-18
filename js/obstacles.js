/* ==========================================================================
   TEMPLE RUN - OBSTACLE & POWERUP SYSTEM
   ========================================================================== */

import { LANE_WIDTH, LANES } from './player.js';

export const OBSTACLE_TYPES = {
  PILLAR: 'pillar',       // Avoid by changing lane
  LOW_BEAM: 'low_beam',   // Slide under
  HIGH_BARRIER: 'barrier',// Jump over
};

export const POWERUP_TYPES = {
  COIN: 'coin',
  MAGNET: 'magnet',
  SHIELD: 'shield',
  MULTIPLIER: 'multiplier'
};

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.collectibles = [];

    // Shared Geometries & Materials
    this.initAssets();

    this.spawnDistance = -80; // Distance where new items spawn
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

    this.laserMat = new THREE.MeshBasicMaterial({
      color: 0xff3344
    });

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

    // Coin Mesh Template (Thin Cylinder)
    this.coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
    this.coinGeo.rotateX(Math.PI / 2);
  }

  spawnPattern(playerZ) {
    // Generate new obstacles ahead of player
    const spawnZ = playerZ - 80;

    const r = Math.random();
    const laneKeys = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];

    if (r < 0.45) {
      // 1. Single or Double Pillar Obstacle
      const chosenLane = laneKeys[Math.floor(Math.random() * laneKeys.length)];
      this.createPillar(chosenLane, spawnZ);

      // Fill empty lanes with coins
      laneKeys.filter(l => l !== chosenLane).forEach(l => {
        if (Math.random() < 0.5) this.spawnCoinLine(l, spawnZ - 10, 5);
      });
    } else if (r < 0.7) {
      // 2. Low Obsidian Beam (Slide under)
      this.createLowBeam(spawnZ);
      this.spawnCoinLine(LANES.CENTER, spawnZ, 4, 0.4); // Coins low to encourage sliding
    } else {
      // 3. High Barrier (Jump over)
      const chosenLane = laneKeys[Math.floor(Math.random() * laneKeys.length)];
      this.createHighBarrier(chosenLane, spawnZ);
      this.spawnCoinLine(chosenLane, spawnZ - 4, 4, 1.6); // Floating coins for jump arc
    }

    // Chance for Power-up
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

    // Spiked Gold Trim
    const trimGeo = new THREE.BoxGeometry(1.45, 0.3, 0.85);
    const trim = new THREE.Mesh(trimGeo, this.goldMat);
    trim.position.y = 2.8;
    group.add(trim);

    group.position.set(lane * LANE_WIDTH, 0, z);

    // Bounding Box
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
    
    // Spans all 3 lanes
    const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 3.2, 0.8, 0.5);
    const beam = new THREE.Mesh(beamGeo, this.obsidianMat);
    beam.position.y = 1.6; // High enough to slide under
    group.add(beam);

    const laser = new THREE.Mesh(new THREE.BoxGeometry(LANE_WIDTH * 3.2, 0.15, 0.55), this.laserMat);
    laser.position.y = 1.2;
    group.add(laser);

    group.position.set(0, 0, z);

    // Bounding Box for head collision
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
    mesh.position.y = 0.35; // Low barrier on ground, must jump over
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

      const radius = 0.4;
      const sphere = new THREE.Sphere(coinMesh.position, radius);

      this.collectibles.push({
        type: POWERUP_TYPES.COIN,
        mesh: coinMesh,
        sphere: sphere,
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

    const sphere = new THREE.Sphere(mesh.position, 0.6);

    this.collectibles.push({
      type: type,
      mesh: mesh,
      sphere: sphere,
      active: true
    });

    this.scene.add(mesh);
  }

  update(dt, player, currentSpeed) {
    const moveZ = currentSpeed * dt;

    // 1. Move & Rotate Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.mesh.position.z += moveZ;
      item.mesh.rotation.y += dt * 3.5; // Spinning animation

      // Magnet Logic (Attract Coins towards Player)
      if (player.hasMagnet && item.type === POWERUP_TYPES.COIN && item.mesh.position.z > -25) {
        const pPos = player.position;
        item.mesh.position.lerp(new THREE.Vector3(pPos.x, pPos.y + 0.8, pPos.z), dt * 10.0);
      }

      // Cleanup items behind camera
      if (item.mesh.position.z > 5 || !item.active) {
        this.scene.remove(item.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    // 2. Move & Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.mesh.position.z += moveZ;

      // Update bounding box position
      if (obs.type === OBSTACLE_TYPES.LOW_BEAM) {
        obs.box.min.z = obs.mesh.position.z - 0.3;
        obs.box.max.z = obs.mesh.position.z + 0.3;
      } else {
        obs.box.setFromObject(obs.mesh);
      }

      // Cleanup obstacles behind camera
      if (obs.mesh.position.z > 8) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // Spawning logic (Keep generating obstacles along path)
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
