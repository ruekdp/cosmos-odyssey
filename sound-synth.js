/**
 * COSMOS // Web Audio API Cosmic Synthesizer
 * Generates synthetic deep space ambient drones, warp sweeps,
 * planetary frequencies, and cybernetic UI feedback.
 */

class CosmicSoundSynth {
  constructor() {
    this.ctx = null;
    this.isAmbientPlaying = false;
    
    // Ambient sound nodes
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.droneGain = null;
    this.lfo = null;

    this.toggleBtn = document.getElementById('audio-toggle-btn');
    this.statusText = document.getElementById('audio-status-text');
    this.waveBars = document.querySelector('.audio-wave-bars');

    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleAmbient());
    }

    // Planetary sound buttons
    const scanBtns = document.querySelectorAll('.exo-audio-scan-btn');
    scanBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const freq = parseFloat(btn.getAttribute('data-freq') || 400);
        this.playPlanetaryTone(freq);
      });
    });
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAmbient() {
    this.ensureContext();

    if (this.isAmbientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  startAmbient() {
    if (this.isAmbientPlaying) return;

    // Sub-bass drone 1 (55Hz, A1)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Detuned sub-bass drone 2 (55.4Hz for binaural beating)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(55.4, this.ctx.currentTime);

    // Warm Lowpass Filter
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // LFO to slowly sweep filter cutoff
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);

    // Master drone gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.droneGain.gain.exponentialRampToValueAtTime(0.28, this.ctx.currentTime + 3);

    // Connect chain
    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.lfo.start();

    this.isAmbientPlaying = true;
    if (this.statusText) this.statusText.textContent = 'ЭМБИЕНТ: ВКЛ';
    if (this.waveBars) this.waveBars.classList.add('active');
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;

    if (this.droneGain) {
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          if (this.droneOsc1) this.droneOsc1.stop();
          if (this.droneOsc2) this.droneOsc2.stop();
          if (this.lfo) this.lfo.stop();
        } catch (e) {}
      }, 1250);
    }

    this.isAmbientPlaying = false;
    if (this.statusText) this.statusText.textContent = 'ЭМБИЕНТ: ВЫКЛ';
    if (this.waveBars) this.waveBars.classList.remove('active');
  }

  /**
   * Sci-Fi UI Blip sound
   */
  playBlip(freq = 600) {
    try {
      this.ensureContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  /**
   * Sound effect when switching celestial body
   */
  playSwitchSound() {
    try {
      this.ensureContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch (e) {}
  }

  /**
   * Hyperspace Warp Jump Audio
   */
  playWarpSound() {
    try {
      this.ensureContext();
      
      // Sweep Oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      // Filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.25);
    } catch (e) {}
  }

  /**
   * Resonant atmospheric frequency of exoplanet
   */
  playPlanetaryTone(freq) {
    try {
      this.ensureContext();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      // Vibrato
      osc.frequency.linearRampToValueAtTime(freq + 8, this.ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(freq - 4, this.ctx.currentTime + 1.0);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      if (panner) {
        panner.pan.setValueAtTime(-0.3, this.ctx.currentTime);
        panner.pan.linearRampToValueAtTime(0.3, this.ctx.currentTime + 1.8);
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.85);
    } catch (e) {}
  }
}

// Global instance
window.addEventListener('DOMContentLoaded', () => {
  window.CosmicSynth = new CosmicSoundSynth();
});
