/**
 * COSMOS // Relativistic Time Dilation Lab
 * Implements Einstein's General and Special Relativity:
 * Dilation Factor: Gamma = 1 / sqrt(1 - Rs/r - (v/c)^2)
 */

class TimeDilationLab {
  constructor() {
    this.gravitySlider = document.getElementById('gravity-slider');
    this.speedSlider = document.getElementById('speed-slider');
    this.proximityVal = document.getElementById('proximity-val');
    this.speedVal = document.getElementById('speed-val');
    
    this.earthClockDisplay = document.getElementById('earth-clock');
    this.shipClockDisplay = document.getElementById('ship-clock');
    this.earthYearsDisplay = document.getElementById('earth-years-passed');
    this.factorDisplay = document.getElementById('dilation-factor-display');
    this.factorDesc = document.getElementById('factor-earth-equivalent');
    
    this.startBtn = document.getElementById('start-time-exp-btn');
    this.btnText = document.getElementById('exp-btn-text');
    this.resetBtn = document.getElementById('reset-time-exp-btn');

    this.isRunning = false;
    this.shipSeconds = 0;
    this.earthSeconds = 0;
    this.timerInterval = null;
    this.dilationFactor = 1;

    this.init();
  }

  init() {
    if (!this.gravitySlider || !this.speedSlider) return;

    this.calculateDilation();

    this.gravitySlider.addEventListener('input', () => {
      this.proximityVal.textContent = `${parseFloat(this.gravitySlider.value).toFixed(2)} Rs`;
      this.calculateDilation();
      if (window.CosmicSynth) window.CosmicSynth.playBlip(400);
    });

    this.speedSlider.addEventListener('input', () => {
      this.speedVal.textContent = `${parseFloat(this.speedSlider.value).toFixed(1)}% c`;
      this.calculateDilation();
      if (window.CosmicSynth) window.CosmicSynth.playBlip(500);
    });

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.toggleExperiment());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetExperiment());
    }
  }

  calculateDilation() {
    const r = parseFloat(this.gravitySlider.value); // r in units of Rs
    const vPercent = parseFloat(this.speedSlider.value); // v in % of c
    const beta = (vPercent / 100) * 0.9999; // Cap to avoid division by 0

    // Gravitational component: sqrt(1 - 1/r)
    const gravTerm = Math.max(0.0001, 1 - (1 / r));
    // Velocity component: sqrt(1 - beta^2)
    const velTerm = Math.max(0.0001, 1 - Math.pow(beta, 2));

    // Combined metric factor
    const combined = Math.sqrt(gravTerm * velTerm);
    this.dilationFactor = Math.max(1, 1 / combined);

    // Update factor display
    if (this.dilationFactor > 1000000) {
      this.factorDisplay.textContent = `∞ (СИНГУЛЯРНОСТЬ)`;
      this.factorDesc.textContent = `Время на корабле остановлено для наблюдателя`;
    } else {
      this.factorDisplay.textContent = `${Math.round(this.dilationFactor).toLocaleString('ru-RU')}×`;
      
      // Calculate equivalent
      const earthSecInOneShipMin = this.dilationFactor * 60;
      if (earthSecInOneShipMin < 3600) {
        this.factorDesc.textContent = `1 минута экипажа = ${(earthSecInOneShipMin / 60).toFixed(1)} мин на Земле`;
      } else if (earthSecInOneShipMin < 86400) {
        this.factorDesc.textContent = `1 минута экипажа = ${(earthSecInOneShipMin / 3600).toFixed(1)} час(ов) на Земле`;
      } else if (earthSecInOneShipMin < 31536000) {
        this.factorDesc.textContent = `1 минута экипажа = ${(earthSecInOneShipMin / 86400).toFixed(1)} дн. на Земле`;
      } else {
        this.factorDesc.textContent = `1 минута экипажа = ${(earthSecInOneShipMin / 31536000).toFixed(2)} лет на Земле`;
      }
    }
  }

  toggleExperiment() {
    if (this.isRunning) {
      this.pauseExperiment();
    } else {
      this.startExperiment();
    }
  }

  startExperiment() {
    this.isRunning = true;
    if (this.btnText) this.btnText.textContent = 'ПРИОСТАНОВИТЬ ТАЙМЕР';
    if (this.startBtn) this.startBtn.classList.replace('glow-cyan', 'glow-purple');

    if (window.CosmicSynth) window.CosmicSynth.playBlip(880);

    const stepMs = 50;
    this.timerInterval = setInterval(() => {
      // 50ms of proper ship time
      const dt = stepMs / 1000;
      this.shipSeconds += dt;
      this.earthSeconds += dt * this.dilationFactor;

      this.updateDisplays();
    }, stepMs);
  }

  pauseExperiment() {
    this.isRunning = false;
    if (this.btnText) this.btnText.textContent = 'ВОЗОБНОВИТЬ ТАЙМЕР';
    if (this.startBtn) this.startBtn.classList.replace('glow-purple', 'glow-cyan');
    clearInterval(this.timerInterval);
  }

  resetExperiment() {
    this.pauseExperiment();
    this.shipSeconds = 0;
    this.earthSeconds = 0;
    if (this.btnText) this.btnText.textContent = 'ЗАПУСТИТЬ ТАЙМЕР ЭКСПЕДИЦИИ';
    this.updateDisplays();
    if (window.CosmicSynth) window.CosmicSynth.playBlip(250);
  }

  formatTime(totalSec) {
    const s = Math.floor(totalSec % 60);
    const m = Math.floor((totalSec / 60) % 60);
    const h = Math.floor(totalSec / 3600);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  updateDisplays() {
    if (this.shipClockDisplay) {
      this.shipClockDisplay.textContent = this.formatTime(this.shipSeconds);
    }

    if (this.earthClockDisplay) {
      this.earthClockDisplay.textContent = this.formatTime(this.earthSeconds);
    }

    if (this.earthYearsDisplay) {
      const days = this.earthSeconds / 86400;
      const years = days / 365.25;

      if (years >= 1) {
        this.earthYearsDisplay.innerHTML = `Прошло на Земле: <strong class="highlight-cyan">${years.toFixed(2)} лет</strong>`;
      } else if (days >= 1) {
        this.earthYearsDisplay.innerHTML = `Прошло на Земле: <strong class="highlight-cyan">${days.toFixed(1)} дней</strong>`;
      } else {
        const hours = (this.earthSeconds / 3600).toFixed(1);
        this.earthYearsDisplay.innerHTML = `Прошло на Земле: <strong class="highlight-cyan">${hours} ч</strong>`;
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.TimeDilationLabInstance = new TimeDilationLab();
});
