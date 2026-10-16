/**
 * COSMOS // Spacetime Fabric Simulator
 * Simulates Einstein's General Relativity: mass warping the 2D quantum mesh,
 * creating gravitational wells and geodesic bending.
 */

class SpacetimeSimulator {
  constructor() {
    this.canvas = document.getElementById('spacetime-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.cols = 28;
    this.rows = 18;
    this.points = [];
    
    // Gravitational mass position (follows mouse or auto-orbits)
    this.mass = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      radius: 40,
      intensity: 75,
      isDragging: false
    };

    // Test photons / particles trapped in orbit
    this.particles = [];
    this.numParticles = 24;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate coordinate grid nodes
    this.createGrid();
    this.createParticles();

    // Mouse & Touch interaction
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mass.targetX = e.clientX - rect.left;
      this.mass.targetY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mass.intensity = 130; // Stronger gravity on click
      if (window.CosmicSynth) window.CosmicSynth.playBlip(320);
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mass.intensity = 75;
    });

    this.canvas.addEventListener('mouseleave', () => {
      // Auto orbit in center when mouse leaves
      this.autoOrbit = true;
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.autoOrbit = false;
    });

    this.autoOrbit = true;
    this.angle = 0;

    // Loop
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width - 32;
    this.canvas.height = 360;
    this.createGrid();
  }

  createGrid() {
    this.points = [];
    const stepX = this.canvas.width / (this.cols - 1);
    const stepY = this.canvas.height / (this.rows - 1);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const originX = c * stepX;
        const originY = r * stepY;
        this.points.push({
          originX: originX,
          originY: originY,
          x: originX,
          y: originY
        });
      }
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        orbitRadius: 40 + Math.random() * 90,
        angle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2,
        tail: []
      });
    }
  }

  render() {
    requestAnimationFrame(this.render);

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Auto orbit if not hovering
    if (this.autoOrbit) {
      this.angle += 0.02;
      this.mass.targetX = w / 2 + Math.cos(this.angle) * 70;
      this.mass.targetY = h / 2 + Math.sin(this.angle * 1.5) * 45;
    }

    // Smooth lerp mass
    this.mass.x += (this.mass.targetX - this.mass.x) * 0.08;
    this.mass.y += (this.mass.targetY - this.mass.y) * 0.08;

    // Distort grid nodes according to gravitational inverse-square law
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const dx = this.mass.x - p.originX;
      const dy = this.mass.y - p.originY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gravitational deflection factor
      const pull = Math.min(this.mass.intensity, (this.mass.intensity * 25) / (dist + 15));
      const angle = Math.atan2(dy, dx);

      p.x = p.originX + Math.cos(angle) * pull;
      p.y = p.originY + Math.sin(angle) * pull;
    }

    // 1. Draw distorted Spacetime Grid lines
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let r = 0; r < this.rows; r++) {
      ctx.beginPath();
      for (let c = 0; c < this.cols; c++) {
        const p = this.points[r * this.cols + c];
        if (c === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.18)';
      ctx.stroke();
    }

    // Vertical lines
    for (let c = 0; c < this.cols; c++) {
      ctx.beginPath();
      for (let r = 0; r < this.rows; r++) {
        const p = this.points[r * this.cols + c];
        if (r === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(157, 78, 221, 0.18)';
      ctx.stroke();
    }

    // 2. Draw Gravitational Singularity Core
    const grad = ctx.createRadialGradient(this.mass.x, this.mass.y, 0, this.mass.x, this.mass.y, 45);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.35, 'rgba(0, 243, 255, 0.5)');
    grad.addColorStop(0.7, 'rgba(157, 78, 221, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.mass.x, this.mass.y, 45, 0, Math.PI * 2);
    ctx.fill();

    // Event horizon ring
    ctx.beginPath();
    ctx.arc(this.mass.x, this.mass.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Orbiting photons / matter
    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
      part.angle += part.speed;

      const px = this.mass.x + Math.cos(part.angle) * part.orbitRadius;
      const py = this.mass.y + Math.sin(part.angle) * (part.orbitRadius * 0.45); // Elliptical projection

      // Tail
      part.tail.push({ x: px, y: py });
      if (part.tail.length > 8) part.tail.shift();

      ctx.beginPath();
      for (let t = 0; t < part.tail.length; t++) {
        const tp = part.tail[t];
        if (t === 0) ctx.moveTo(tp.x, tp.y);
        else ctx.lineTo(tp.x, tp.y);
      }
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Particle head
      ctx.beginPath();
      ctx.arc(px, py, part.size, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#00f3ff' : '#ffb703';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.SpacetimeSimulatorInstance = new SpacetimeSimulator();
});
