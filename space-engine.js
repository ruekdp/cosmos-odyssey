/**
 * COSMOS // 3D WebGL Engine
 * Powered by Three.js
 * Features: Multi-body celestial simulations, relativistic accretion disk,
 * volumetric starfield, warp drive hyperjump mechanics.
 */

class SpaceEngine {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // State
    this.activeBodyKey = 'blackhole';
    this.celestialBodies = {};
    this.isWarping = false;
    this.wireframeMode = false;
    this.spinSpeedMultiplier = 1;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    // Warp starfield system
    this.starField = null;
    this.starGeo = null;
    this.starVelocities = [];
    
    // Animation frame tracking
    this.clock = new THREE.Clock();
    
    this.init();
  }

  init() {
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Three.js or WebGL container not found.');
      return;
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020208, 0.0008);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 8000);
    this.camera.position.set(0, 5, 30);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x020206, 1.0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 120;
      this.controls.minDistance = 8;
      this.controls.enablePan = true;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.6;
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Build Starfield & Nebula
    this.createCosmicStarfield();
    this.createVolumetricNebula();

    // 7. Build Celestial Objects
    this.createBlackHoleSystem();
    this.createEarthSystem();
    this.createSaturnSystem();
    this.createKeplerSystem();
    this.createPulsarSystem();

    // Set initial active celestial body
    this.switchCelestialBody('blackhole', false);

    // 8. Event listeners
    this.bindEvents();

    // 9. Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient faint starlight
    const ambientLight = new THREE.AmbientLight(0x0a1020, 0.6);
    this.scene.add(ambientLight);

    // Main celestial key light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    this.keyLight.position.set(30, 20, 25);
    this.scene.add(this.keyLight);

    // Subtle rim lights
    const rimLight1 = new THREE.PointLight(0x00f3ff, 1.0, 60);
    rimLight1.position.set(-25, 15, -20);
    this.scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x9d4edd, 1.0, 60);
    rimLight2.position.set(20, -15, -15);
    this.scene.add(rimLight2);
  }

  createCosmicStarfield() {
    const starCount = 8000;
    this.starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    this.starVelocities = [];

    const starColors = [
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xa2d2ff), // Blue-white
      new THREE.Color(0x00f3ff), // Cyan
      new THREE.Color(0xffb703), // Yellow-orange
      new THREE.Color(0xff0055)  // Red giant
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 600 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[idx + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[idx] = color.r;
      colors[idx + 1] = color.g;
      colors[idx + 2] = color.b;

      // Base velocity for warp drive
      this.starVelocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: Math.random() * 0.5 + 0.2
      });
    }

    this.starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular glowing star texture
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const ctx = starCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(0,243,255,0.8)');
    grad.addColorStop(0.7, 'rgba(157,78,221,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 3.5,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starField = new THREE.Points(this.starGeo, starMat);
    this.scene.add(this.starField);
  }

  createVolumetricNebula() {
    const nebulaCount = 180;
    const nebulaGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);

    const nebulaPalette = [
      new THREE.Color(0x7b2cbf),
      new THREE.Color(0x0077b6),
      new THREE.Color(0x240046),
      new THREE.Color(0x03045e)
    ];

    for (let i = 0; i < nebulaCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 600;
      positions[idx + 1] = (Math.random() - 0.5) * 300;
      positions[idx + 2] = -400 - Math.random() * 500; // Deep background only, never near camera!

      const col = nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)];
      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 25,
      vertexColors: true,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nebulaMesh = new THREE.Points(nebulaGeo, nebulaMat);
    this.scene.add(this.nebulaMesh);
  }

  /* ----------------------------------------------------
     CELESTIAL OBJECT 1: GARGANTUA (BLACK HOLE)
     ---------------------------------------------------- */
  createBlackHoleSystem() {
    const group = new THREE.Group();

    // 1. Event horizon (Pitch black sphere)
    const horizonGeo = new THREE.SphereGeometry(4.2, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizon);

    // 2. Gravitational Photon Ring Glow
    const photonRingGeo = new THREE.RingGeometry(4.25, 4.7, 64);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    group.add(photonRing);

    // 3. Realistic Accretion Disk (Particles with Doppler shift & vortex)
    const particleCount = 7000;
    const diskGeo = new THREE.BufferGeometry();
    const diskPos = new Float32Array(particleCount * 3);
    const diskCols = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Exponential distribution towards the center
      const r = 5.2 + Math.pow(Math.random(), 1.8) * 16;
      const angle = Math.random() * Math.PI * 2;
      
      diskPos[idx] = Math.cos(angle) * r;
      diskPos[idx + 1] = (Math.random() - 0.5) * (0.3 + (r - 5) * 0.08); // Slight flare outwards
      diskPos[idx + 2] = Math.sin(angle) * r;

      // Color based on temperature & distance from center (inner is blazing cyan/white, outer is fiery orange/purple)
      const ratio = (r - 5.2) / 16;
      if (ratio < 0.25) {
        // Superheated relativistic inner ring
        diskCols[idx] = 0.8 + Math.random() * 0.2;
        diskCols[idx + 1] = 0.9 + Math.random() * 0.1;
        diskCols[idx + 2] = 1.0;
      } else if (ratio < 0.6) {
        // Mid disk: Golden amber
        diskCols[idx] = 1.0;
        diskCols[idx + 1] = 0.6 + Math.random() * 0.2;
        diskCols[idx + 2] = 0.1;
      } else {
        // Outer cooler dust: Crimson purple
        diskCols[idx] = 0.7;
        diskCols[idx + 1] = 0.1;
        diskCols[idx + 2] = 0.6 + Math.random() * 0.3;
      }
    }

    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPos, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(diskCols, 3));

    const diskMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const accretionDisk = new THREE.Points(diskGeo, diskMat);
    accretionDisk.rotation.x = Math.PI * 0.38; // Tilted towards camera like Gargantua
    accretionDisk.rotation.z = Math.PI * 0.1;
    group.add(accretionDisk);

    // 4. Gravitational Lensing Halo (Secondary vertical ghost ring)
    const haloRingGeo = new THREE.RingGeometry(4.4, 7.8, 64);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRing.rotation.y = Math.PI * 0.2;
    group.add(haloRing);

    // 5. Relativistic Polar Jets
    const jetGeo = new THREE.CylinderGeometry(0.2, 2.5, 30, 32, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const jet = new THREE.Mesh(jetGeo, jetMat);
    jet.position.y = 0;
    group.add(jet);

    this.celestialBodies.blackhole = {
      group: group,
      update: (delta) => {
        accretionDisk.rotation.y += delta * 0.45 * this.spinSpeedMultiplier;
        photonRing.rotation.z += delta * 0.3;
        haloRing.rotation.z -= delta * 0.1;
      }
    };
    this.scene.add(group);
  }

  /* ----------------------------------------------------
     CELESTIAL OBJECT 2: EARTH & ORBITING SATELLITE
     ---------------------------------------------------- */
  createEarthSystem() {
    const group = new THREE.Group();

    // Procedural canvas texture for Earth continents
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    ctx.fillStyle = '#06193d';
    ctx.fillRect(0, 0, 1024, 512);

    // Procedural landmass blobs
    ctx.fillStyle = '#1c4936';
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 350;
      const r = 30 + Math.random() * 70;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Highlighting mountain ranges
    ctx.fillStyle = '#4a5b35';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1024;
      const y = 100 + Math.random() * 300;
      ctx.beginPath();
      ctx.arc(x, y, 15 + Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ice caps
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, 1024, 45);
    ctx.fillRect(0, 467, 1024, 45);

    const earthTex = new THREE.CanvasTexture(canvas);

    // Earth globe
    const earthGeo = new THREE.SphereGeometry(6, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    group.add(earthMesh);

    // Atmosphere Glow (Fresnel-like outer layer)
    const atmoGeo = new THREE.SphereGeometry(6.3, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    group.add(atmosphere);

    // Dynamic Cloud Shell
    const cloudGeo = new THREE.SphereGeometry(6.08, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    group.add(clouds);

    // Orbiting Satellite / ISS beacon
    const satGroup = new THREE.Group();
    const satGeo = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    satMesh.position.set(8.5, 0, 0);
    satGroup.add(satMesh);
    group.add(satGroup);

    this.celestialBodies.earth = {
      group: group,
      update: (delta) => {
        earthMesh.rotation.y += delta * 0.12 * this.spinSpeedMultiplier;
        clouds.rotation.y += delta * 0.16 * this.spinSpeedMultiplier;
        satGroup.rotation.y += delta * 0.8;
        satGroup.rotation.x += delta * 0.2;
      }
    };
    this.scene.add(group);
  }

  /* ----------------------------------------------------
     CELESTIAL OBJECT 3: SATURN & DETAILED RINGS
     ---------------------------------------------------- */
  createSaturnSystem() {
    const group = new THREE.Group();

    // Saturn gas body
    const satGeo = new THREE.SphereGeometry(5.2, 64, 64);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xe0cda9,
      roughness: 0.7,
      metalness: 0.1
    });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    group.add(satMesh);

    // Rings
    const ringGeo = new THREE.RingGeometry(6.8, 14, 64);
    
    // Procedural ring stripes texture
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 512;
    rCanvas.height = 1;
    const rCtx = rCanvas.getContext('2d');
    const ringGrad = rCtx.createLinearGradient(0, 0, 512, 0);
    ringGrad.addColorStop(0.0, 'rgba(0,0,0,0)');
    ringGrad.addColorStop(0.1, 'rgba(210,185,150,0.8)');
    ringGrad.addColorStop(0.4, 'rgba(160,135,100,0.5)');
    ringGrad.addColorStop(0.55, 'rgba(0,0,0,0.05)'); // Cassini division
    ringGrad.addColorStop(0.65, 'rgba(230,205,170,0.9)');
    ringGrad.addColorStop(0.9, 'rgba(180,150,110,0.4)');
    ringGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
    rCtx.fillStyle = ringGrad;
    rCtx.fillRect(0, 0, 512, 1);

    const ringTex = new THREE.CanvasTexture(rCanvas);
    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.5
    });

    const rings = new THREE.Mesh(ringGeo, ringMat);
    rings.rotation.x = Math.PI * 0.65;
    rings.rotation.y = Math.PI * 0.1;
    group.add(rings);

    this.celestialBodies.saturn = {
      group: group,
      update: (delta) => {
        satMesh.rotation.y += delta * 0.2 * this.spinSpeedMultiplier;
        rings.rotation.z += delta * 0.05;
      }
    };
    this.scene.add(group);
  }

  /* ----------------------------------------------------
     CELESTIAL OBJECT 4: KEPLER-452B (EXOPLANET)
     ---------------------------------------------------- */
  createKeplerSystem() {
    const group = new THREE.Group();

    // Alien world: Cyan/Violet Bioluminescent planet
    const kepGeo = new THREE.SphereGeometry(6.5, 64, 64);
    const kepMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.45,
      metalness: 0.3
    });
    const kepMesh = new THREE.Mesh(kepGeo, kepMat);
    group.add(kepMesh);

    // Bioluminescent auroral atmospheric halo
    const haloGeo = new THREE.SphereGeometry(6.8, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    // Orbiting Moon
    const moonGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x8899aa });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(11, 2, 0);
    const moonPivot = new THREE.Group();
    moonPivot.add(moon);
    group.add(moonPivot);

    this.celestialBodies.kepler = {
      group: group,
      update: (delta) => {
        kepMesh.rotation.y += delta * 0.15 * this.spinSpeedMultiplier;
        moonPivot.rotation.y += delta * 0.4;
      }
    };
    this.scene.add(group);
  }

  /* ----------------------------------------------------
     CELESTIAL OBJECT 5: NEUTRON PULSAR
     ---------------------------------------------------- */
  createPulsarSystem() {
    const group = new THREE.Group();

    // Ultra-dense core sphere
    const coreGeo = new THREE.SphereGeometry(3.2, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Violent magnetic field rings
    const magRings = [];
    for (let i = 0; i < 4; i++) {
      const rGeo = new THREE.TorusGeometry(4.5 + i * 1.2, 0.08, 16, 64);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI * (0.2 + i * 0.15);
      ring.rotation.y = Math.PI * (i * 0.3);
      group.add(ring);
      magRings.push(ring);
    }

    // Collimated Relativistic Beams from poles
    const beamGeo = new THREE.ConeGeometry(3.5, 45, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    const northBeam = new THREE.Mesh(beamGeo, beamMat);
    northBeam.position.y = 22;
    northBeam.rotation.x = Math.PI;
    group.add(northBeam);

    const southBeam = new THREE.Mesh(beamGeo, beamMat);
    southBeam.position.y = -22;
    group.add(southBeam);

    this.celestialBodies.pulsar = {
      group: group,
      update: (delta) => {
        // High-velocity pulsar rotation
        group.rotation.y += delta * 4.5 * this.spinSpeedMultiplier;
        group.rotation.z = Math.sin(this.clock.getElapsedTime() * 3) * 0.15;
        magRings.forEach((r, idx) => {
          r.rotation.z += delta * (idx + 1);
        });
      }
    };
    this.scene.add(group);
  }

  /* ----------------------------------------------------
     OBJECT SWITCHER & GSAP CAMERA TRANSITIONS
     ---------------------------------------------------- */
  switchCelestialBody(key, animateCamera = true) {
    if (!this.celestialBodies[key]) return;
    this.activeBodyKey = key;

    // Show only the selected celestial group, hide others
    Object.keys(this.celestialBodies).forEach(k => {
      const obj = this.celestialBodies[k];
      if (k === key) {
        obj.group.visible = true;
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(obj.group.scale, { x: 0.3, y: 0.3, z: 0.3 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: "power3.out" });
        }
      } else {
        obj.group.visible = false;
      }
    });

    if (animateCamera && typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: (Math.random() - 0.5) * 8,
        y: 4 + Math.random() * 4,
        z: 26 + (key === 'saturn' ? 8 : 0),
        duration: 1.4,
        ease: "power2.inOut",
        onUpdate: () => {
          if (this.controls) this.controls.update();
        }
      });
    }

    // Play synthetic sound effect
    if (window.CosmicSynth) {
      window.CosmicSynth.playSwitchSound();
    }
  }

  /* ----------------------------------------------------
     HYPERDRIVE / WARP SPEED JUMP
     ---------------------------------------------------- */
  engageWarpDrive() {
    if (this.isWarping) return;
    this.isWarping = true;

    const flash = document.getElementById('warp-flash-overlay');
    if (flash) flash.classList.add('active');

    if (window.CosmicSynth) {
      window.CosmicSynth.playWarpSound();
    }

    // Camera FOV warp stretch
    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera, {
        fov: 95,
        duration: 0.8,
        ease: "power3.in",
        onUpdate: () => this.camera.updateProjectionMatrix()
      });
    }

    setTimeout(() => {
      // Pick next celestial body randomly or sequentially
      const keys = Object.keys(this.celestialBodies);
      const nextIdx = (keys.indexOf(this.activeBodyKey) + 1) % keys.length;
      this.switchCelestialBody(keys[nextIdx], false);

      // Flash down and FOV snap back
      if (flash) flash.classList.remove('active');
      
      if (typeof gsap !== 'undefined') {
        gsap.to(this.camera, {
          fov: 50,
          duration: 1.2,
          ease: "power3.out",
          onUpdate: () => this.camera.updateProjectionMatrix()
        });
      }

      this.isWarping = false;

      // Update active tab in UI
      const activeTab = document.querySelector(`.selector-tab[data-target="${keys[nextIdx]}"]`);
      if (activeTab) activeTab.click();
    }, 900);
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    const curGroup = this.celestialBodies[this.activeBodyKey]?.group;
    if (curGroup) {
      curGroup.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.wireframe = this.wireframeMode;
        }
      });
    }
    if (window.CosmicSynth) window.CosmicSynth.playBlip(600);
  }

  toggleSpinSpeed() {
    this.spinSpeedMultiplier = this.spinSpeedMultiplier === 1 ? 3.5 : 1;
    if (window.CosmicSynth) window.CosmicSynth.playBlip(750);
  }

  resetCamera() {
    if (typeof gsap !== 'undefined') {
      gsap.to(this.camera.position, {
        x: 0,
        y: 5,
        z: 30,
        duration: 1.2,
        ease: "power2.out"
      });
      if (this.controls) {
        gsap.to(this.controls.target, { x: 0, y: 0, z: 0, duration: 1.2 });
      }
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Warp buttons
    const warpBtn = document.getElementById('warp-drive-btn');
    if (warpBtn) warpBtn.addEventListener('click', () => this.engageWarpDrive());

    const quickWarpBtn = document.getElementById('hero-quick-warp');
    if (quickWarpBtn) quickWarpBtn.addEventListener('click', () => this.engageWarpDrive());

    // Controls
    const wireframeBtn = document.getElementById('toggle-wireframe-btn');
    if (wireframeBtn) wireframeBtn.addEventListener('click', () => this.toggleWireframe());

    const spinBtn = document.getElementById('toggle-spin-speed');
    if (spinBtn) spinBtn.addEventListener('click', () => this.toggleSpinSpeed());

    const resetCamBtn = document.getElementById('reset-cam-btn');
    if (resetCamBtn) resetCamBtn.addEventListener('click', () => this.resetCamera());
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Mouse parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Update active celestial object
    const activeObj = this.celestialBodies[this.activeBodyKey];
    if (activeObj && activeObj.update) {
      activeObj.update(delta);
    }

    // Update starfield (cosmic drift or warp streak)
    if (this.starGeo && this.starGeo.attributes.position) {
      const pos = this.starGeo.attributes.position.array;
      const speedMult = this.isWarping ? 35 : 1;

      for (let i = 0; i < this.starVelocities.length; i++) {
        const idx = i * 3;
        pos[idx + 2] += this.starVelocities[i].z * speedMult;

        // Reset stars that pass the camera
        if (pos[idx + 2] > 200) {
          pos[idx + 2] = -1200;
        }
      }
      this.starGeo.attributes.position.needsUpdate = true;
    }

    // Slowly revolve nebula clouds
    if (this.nebulaMesh) {
      this.nebulaMesh.rotation.y += delta * 0.015;
    }

    // Controls update
    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.SpaceEngineInstance = new SpaceEngine();
});
