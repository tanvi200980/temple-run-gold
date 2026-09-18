/* ==========================================================================
   TEMPLE RUN - 3D PLAYER CONTROLLER & ANIMATION SYSTEM
   ========================================================================== */

import { sound } from './audio.js';

export const LANE_WIDTH = 2.4; // Distance between lanes
export const LANES = { LEFT: -1, CENTER: 0, RIGHT: 1 };

export class Player {
  constructor(scene) {
    this.scene = scene;

    // Position & Lane State
    this.currentLane = LANES.CENTER;
    this.targetX = 0;
    this.position = new THREE.Vector3(0, 0, 0);

    // Vertical / Jump Physics
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.gravity = -38.0;
    this.jumpImpulse = 13.5;

    // Slide State
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.75; // seconds

    // Powerup States
    this.hasShield = false;
    this.hasMagnet = false;
    this.hasMultiplier = false;

    // Animation variables
    this.animTime = 0;
    this.runSpeedScale = 1.0;

    // Hitbox Bounding Box
    this.box = new THREE.Box3();

    // Create 3D Mesh hierarchy
    this.createMesh();
    this.createShieldAura();
    this.createParticleTrail();
  }

  createMesh() {
    this.group = new THREE.Group();

    // Materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.5
    });

    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      metalness: 0.5,
      roughness: 0.4
    });

    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    // 1. Torso / Chestplate (Gold Armor)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, goldMat);
    this.torso.position.y = 1.1;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Emblem on chest
    const emblemGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
    const emblemMat = new THREE.MeshBasicMaterial({ color: 0xffb700 });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, 0.1, 0.22);
    this.torso.add(emblem);

    // 2. Head / Helmet (Obsidian with Visor)
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    this.head = new THREE.Mesh(headGeo, obsidianMat);
    this.head.position.y = 0.75;
    this.head.castShadow = true;
    this.torso.add(this.head);

    const visorGeo = new THREE.BoxGeometry(0.38, 0.1, 0.1);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.21);
    this.head.add(visor);

    // 3. Limbs Setup (Arms & Legs)
    const limbGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);

    // Left Arm
    this.leftArm = new THREE.Mesh(limbGeo, obsidianMat);
    this.leftArm.position.set(-0.48, 0.2, 0);
    this.leftArm.geometry.translate(0, -0.3, 0); // Pivot at shoulder
    this.torso.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Mesh(limbGeo, obsidianMat);
    this.rightArm.position.set(0.48, 0.2, 0);
    this.rightArm.geometry.translate(0, -0.3, 0);
    this.torso.add(this.rightArm);

    // Left Leg
    this.leftLeg = new THREE.Mesh(limbGeo, goldMat);
    this.leftLeg.position.set(-0.22, -0.45, 0);
    this.leftLeg.geometry.translate(0, -0.3, 0); // Pivot at hip
    this.torso.add(this.leftLeg);

    // Right Leg
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
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = Math.random() * 0.4;
      positions[i * 3 + 2] = Math.random() * -2.0;
      scales[i] = Math.random();
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

    // 1. Smooth Lane Interpolation (Lerp)
    this.position.x += (this.targetX - this.position.x) * 15 * dt;

    // Bank tilt when changing lanes
    const tilt = (this.targetX - this.position.x) * -0.2;
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, tilt, 0.15);

    // 2. Jump Dynamics
    if (this.isJumping) {
      this.position.y += this.jumpVelocity * dt;
      this.jumpVelocity += this.gravity * dt;

      if (this.position.y <= 0) {
        this.position.y = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    // 3. Slide Dynamics
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Apply main group position
    this.group.position.copy(this.position);

    // 4. Procedural Run & Action Animations
    this.animateLimbs(dt);

    // 5. Update Trail Particles
    this.updateParticles(dt);

    // 6. Shield visual update
    this.shieldMesh.visible = this.hasShield;
    if (this.hasShield) {
      this.shieldMesh.rotation.y += dt * 2.0;
    }

    // 7. Update Bounding Box for Collisions
    this.updateBoundingBox();
  }

  animateLimbs(dt) {
    if (this.isSliding) {
      // Crouch posture
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -Math.PI / 3, 0.2);
      this.torso.position.y = 0.5;
      this.leftArm.rotation.x = -Math.PI / 4;
      this.rightArm.rotation.x = -Math.PI / 4;
      this.leftLeg.rotation.x = Math.PI / 4;
      this.rightLeg.rotation.x = Math.PI / 4;
    } else if (this.isJumping) {
      // Jump pose (arms up, legs tucked)
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.1, 0.2);
      this.torso.position.y = 1.1;
      this.leftArm.rotation.x = -Math.PI * 0.7;
      this.rightArm.rotation.x = -Math.PI * 0.7;
      this.leftLeg.rotation.x = Math.PI * 0.3;
      this.rightLeg.rotation.x = -Math.PI * 0.2;
    } else {
      // Natural Run Cycle
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
      pos[i * 3 + 2] -= dt * 6.0; // move backward
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
