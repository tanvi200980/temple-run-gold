/* ==========================================================================
   TEMPLE RUN - WORLD & ENVIRONMENT GENERATOR
   ========================================================================== */

export const TILE_LENGTH = 16;
export const TOTAL_TILES = 12;

export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.tiles = [];
    this.speed = 12.0;

    // Materials
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

    this.runeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    this.setupLighting();
    this.initTiles();
  }

  setupLighting() {
    // Atmospheric dark fog
    this.scene.fog = new THREE.FogExp2(0x070709, 0.018);

    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffe899, 0.6);
    this.scene.add(ambientLight);

    // Dynamic Directional Sun Light (Gold highlights)
    this.dirLight = new THREE.DirectionalLight(0xfff2a3, 1.4);
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 100;
    this.scene.add(this.dirLight);

    // Point Light following near player area
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

    // Main Track Floor (Obsidian)
    const floorGeo = new THREE.BoxGeometry(8.5, 0.4, TILE_LENGTH);
    const floor = new THREE.Mesh(floorGeo, this.obsidianMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    tileGroup.add(floor);

    // Golden Side Curbs
    const curbGeo = new THREE.BoxGeometry(0.5, 0.6, TILE_LENGTH);
    
    const leftCurb = new THREE.Mesh(curbGeo, this.goldTrimMat);
    leftCurb.position.set(-4.25, 0.1, 0);
    tileGroup.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, this.goldTrimMat);
    rightCurb.position.set(4.25, 0.1, 0);
    tileGroup.add(rightCurb);

    // Inlaid Gold Grid Lines on Floor
    const lineGeo = new THREE.BoxGeometry(7.6, 0.05, 0.3);
    for (let z = -TILE_LENGTH / 2 + 2; z < TILE_LENGTH / 2; z += 4) {
      const line = new THREE.Mesh(lineGeo, this.goldTrimMat);
      line.position.set(0, 0.02, z);
      tileGroup.add(line);
    }

    // Side Pillars (Ancient Temple Columns)
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

        // Pillar Gold Capital
        const cap = new THREE.Mesh(capitalGeo, this.goldTrimMat);
        cap.position.set(x, 4.8, z);
        tileGroup.add(cap);

        // Glowing Rune Emblem
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

    // Recycle tiles that have moved behind camera (Z > TILE_LENGTH)
    const firstTile = this.tiles[0];
    if (firstTile.position.z > TILE_LENGTH) {
      this.tiles.shift(); // Remove from front
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
