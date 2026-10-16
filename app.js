/**
 * COSMOS // Application Controller & HUD State
 * Manages UI interactions, telemetry tracking, observatory data updates,
 * radio transmission console, and smooth scroll spy.
 */

const CELESTIAL_DATABASE = {
  blackhole: {
    name: 'ГАРГАНТЮА',
    badge: 'СВЕРХМАССИВНАЯ ЧЕРНАЯ ДЫРА',
    desc: 'Гравитационный колодец такой невероятной силы, что даже фотоны света не способны преодолеть горизонт событий. Аккреционный диск разогрет до миллионов градусов и генерирует мощнейшее релятивистское излучение.',
    mass: '100 млн M☉',
    radius: '300 млн км',
    temp: '~10,000,000 K',
    rotation: '0.998 c (Керр)',
    coords: 'RA 17h 45m / DEC -29° 00\'',
    distance: '26,000 СВ. ЛЕТ'
  },
  earth: {
    name: 'TERRA // ЗЕМЛЯ',
    badge: 'ПЛАНЕТА С БИОСФЕРОЙ',
    desc: 'Единственный известный мир с развитой углеродной жизнью, жидкими океанами воды и тектоникой плит. Защищена мощным геомагнитным полем от смертоносной солнечной радиации.',
    mass: '5.97 × 10²⁴ кг',
    radius: '6 371 км',
    temp: '+15 °C (средняя)',
    rotation: '23ч 56м 04с',
    coords: 'СЕКТОР СОЛ-3 (ОРИОН)',
    distance: '0 СВ. ЛЕТ (БАЗА)'
  },
  saturn: {
    name: 'САТУРН',
    badge: 'ГАЗОВЫЙ ГИГАНТ С КОЛЬЦАМИ',
    desc: 'Шестая планета от Солнца, обладающая самой грандиозной системой ледяных колец шириной 282 000 км при толщине всего в десятки метров. Плотность атмосферы меньше плотности воды.',
    mass: '95.2 M⊕',
    radius: '58 232 км',
    temp: '-140 °C',
    rotation: '10ч 33м',
    coords: 'СОЛНЕЧНАЯ СИСТЕМА',
    distance: '1.4 млрд км'
  },
  kepler: {
    name: 'KEPLER-452B',
    badge: 'ОБИТАЕМАЯ СУПЕРЗЕМЛЯ',
    desc: 'Старший двоюродный брат Земли. Вращается вокруг солнцеподобной звезды G2. Год длится 385 дней. Атмосферное давление и парниковый эффект создают пригодные для воды условия.',
    mass: '5.0 M⊕',
    radius: '10 190 км',
    temp: '~-8 °C (равновесная)',
    rotation: '~28 часов',
    coords: 'СОЗВЕЗДИЕ ЛЕБЕДЯ',
    distance: '1,402 СВ. ЛЕТ'
  },
  pulsar: {
    name: 'ПУЛЬСАР PSR J1748',
    badge: 'НЕЙТРОННАЯ ЗВЕЗДА',
    desc: 'Сверхплотное ядро погибшей звезды. Совершает 716 оборотов в секунду, испуская мощнейшие конусы синхротронного излучения и радиоимпульсы с точностью превосходящей лучшие атомные часы человечества.',
    mass: '1.8 M☉',
    radius: '11 км',
    temp: '~1,000,000 K',
    rotation: '716 об/сек',
    coords: 'СКОПЛЕНИЕ TERZAN 5',
    distance: '18,000 СВ. ЛЕТ'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initObservatoryTabs();
  initRadioTransmission();
  initScrollSpy();
  initBackToTop();
});

/**
 * 3D Observatory Tabs switching
 */
function initObservatoryTabs() {
  const tabs = document.querySelectorAll('.selector-tab');
  const nameEl = document.getElementById('obj-display-name');
  const badgeEl = document.getElementById('obj-type-badge');
  const descEl = document.getElementById('obj-desc-text');
  const massEl = document.getElementById('spec-mass');
  const radiusEl = document.getElementById('spec-radius');
  const tempEl = document.getElementById('spec-temp');
  const rotEl = document.getElementById('spec-rotation');
  
  // Telemetry headers
  const tCoords = document.getElementById('t-coords');
  const tDistance = document.getElementById('t-distance');
  const tTargetName = document.getElementById('t-target-name');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetKey = tab.getAttribute('data-target');
      if (!targetKey || !CELESTIAL_DATABASE[targetKey]) return;

      // Update active tab style
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const data = CELESTIAL_DATABASE[targetKey];

      // Smooth card transition
      const card = document.getElementById('planet-hud-card');
      if (card && typeof gsap !== 'undefined') {
        gsap.fromTo(card, { opacity: 0.5, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      }

      // Update text
      if (nameEl) nameEl.textContent = data.name;
      if (badgeEl) badgeEl.textContent = data.badge;
      if (descEl) descEl.textContent = data.desc;
      if (massEl) massEl.textContent = data.mass;
      if (radiusEl) radiusEl.textContent = data.radius;
      if (tempEl) tempEl.textContent = data.temp;
      if (rotEl) rotEl.textContent = data.rotation;

      // Update top HUD Telemetry
      if (tCoords) tCoords.textContent = data.coords;
      if (tDistance) tDistance.textContent = data.distance;
      if (tTargetName) tTargetName.textContent = data.name;

      // Tell Three.js Space Engine to switch model
      if (window.SpaceEngineInstance) {
        window.SpaceEngineInstance.switchCelestialBody(targetKey, true);
      }
    });
  });
}

/**
 * Radio Transmission Terminal to the Stars
 */
function initRadioTransmission() {
  const transmitBtn = document.getElementById('transmit-btn');
  const input = document.getElementById('cosmic-message-input');
  const log = document.getElementById('transmission-log');

  if (!transmitBtn || !input || !log) return;

  transmitBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    if (window.CosmicSynth) {
      window.CosmicSynth.playBlip(900);
      setTimeout(() => window.CosmicSynth.playBlip(1200), 100);
    }

    // Convert string to binary preview
    let binaryPreview = '';
    for (let i = 0; i < Math.min(text.length, 6); i++) {
      binaryPreview += text.charCodeAt(i).toString(2).padStart(8, '0') + ' ';
    }

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);

    const logEntry1 = document.createElement('div');
    logEntry1.className = 'console-line';
    logEntry1.style.color = '#00f3ff';
    logEntry1.textContent = `[${timestamp}] > МОДУЛЯЦИЯ СИГНАЛА: "${text}"`;

    const logEntry2 = document.createElement('div');
    logEntry2.className = 'console-line';
    logEntry2.textContent = `[${timestamp}] > ДВОИЧНЫЙ КОД: ${binaryPreview}...`;

    const logEntry3 = document.createElement('div');
    logEntry3.className = 'console-line';
    logEntry3.style.color = '#ffb703';
    logEntry3.textContent = `[${timestamp}] > ИЗЛУЧЕНИЕ ПЕРЕДАНО В КОСМОС СО СКОРОСТЬЮ СВЕТА. ТАРГЕТ: TRAPPIST-1. ВРЕМЯ В ПУТИ: 39 ЛЕТ.`;

    log.appendChild(logEntry1);
    log.appendChild(logEntry2);
    log.appendChild(logEntry3);
    log.scrollTop = log.scrollHeight;

    // Flash button effect
    transmitBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      transmitBtn.style.transform = '';
    }, 150);
  });
}

/**
 * Scroll spy for active navbar highlighting
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.hud-nav-links .nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const sectionHeight = sec.offsetHeight;
      const sectionTop = sec.offsetTop - 120;
      const sectionId = sec.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-nav') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/**
 * Back to top button
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.CosmicSynth) window.CosmicSynth.playBlip(700);
  });
}
