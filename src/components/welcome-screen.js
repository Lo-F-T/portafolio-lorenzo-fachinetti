/**
 * WelcomeScreen
 *
 * Estrategia:
 *  - Los scripts (particle-effect, gallery-filters, gallery-grid, etc.)
 *    se cargan y ejecutan normalmente mientras se muestra la pantalla
 *    de bienvenida — todo inicializa en paralelo.
 *  - El contenido principal (.parent) arranca con clase .main-hidden
 *    (opacity:0, pointer-events:none) para ser invisible pero
 *    ya tener todo listo en memoria.
 *  - Al hacer click en CONTINUAR se quita .main-hidden y los elementos
 *    aparecen en secuencia con animación suave.
 */
 
class WelcomeScreen {
  constructor() {
    this.overlay = null;
    this.hasEntered = false;
    this.init();
  }
 
  init() {
    // Ocultar el contenido principal antes del primer paint visible
    const main = document.querySelector('.parent');
    if (main) main.classList.add('main-hidden');
 
    this.render();
    this.attachEventListeners();
  }
 
  render() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'welcome-overlay';
    this.overlay.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-line"></div>
        <div class="welcome-text-block">
          <span class="welcome-greeting">Hola!,</span>
          <span class="welcome-message">estás a punto de conocer<br>un poco de mi trabajo.</span>
        </div>
        <div class="welcome-line"></div>
        <button class="welcome-btn" id="welcomeContinue">
          <span class="btn-text">CONTINUAR</span>
          <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <p class="welcome-hint">Lorenzo Fachinetti — 2026</p>
      </div>
    `;
    document.body.appendChild(this.overlay);
 
    // Fade-in del overlay en el siguiente frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.overlay.classList.add('visible');
      });
    });
  }
 
  attachEventListeners() {
    document.getElementById('welcomeContinue').addEventListener('click', () => {
      this.dismiss();
    });
 
    document.addEventListener('keydown', (e) => {
      if (!this.hasEntered && (e.key === 'Enter' || e.key === ' ')) {
        this.dismiss();
      }
    });
  }
 
  dismiss() {
    if (this.hasEntered) return;
    this.hasEntered = true;
 
    // Fade-out overlay
    this.overlay.classList.add('dismissing');
 
    // Revelar contenido mientras el overlay desaparece
    setTimeout(() => this.revealMainContent(), 300);
 
    // Remover del DOM al terminar la transición
    setTimeout(() => this.overlay.remove(), 1000);
  }
 
  revealMainContent() {
    const main = document.querySelector('.parent');
    if (!main) return;
 
    // Hacer visible el contenedor (deja de ser main-hidden)
    main.classList.remove('main-hidden');
 
    // Secuencia de elementos que aparecen uno a uno
    const sequence = [
      'header .title-section h1',
      'header .title-section h2',
      'header .title-section .contact-info',
      'header .title-section .header-actions',
      '.filters-container',
      '.grid-container',
      '.info-section',
      '.theme-toggle',
    ];
 
    sequence.forEach((selector, i) => {
      const el = document.querySelector(selector);
      if (!el) return;
 
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'none';
 
      setTimeout(() => {
        el.style.transition = 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.opacity = '';
        el.style.transform = '';
      }, i * 110);
    });
  }
}
 
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.welcomeScreen = new WelcomeScreen();
  });
} else {
  window.welcomeScreen = new WelcomeScreen();
}