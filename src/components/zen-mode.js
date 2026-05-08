class ZenMode {
  constructor() {
    this.active = false;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const btn = document.createElement('button');
    btn.className = 'zen-toggle';
    btn.id = 'zenToggle';
    btn.setAttribute('aria-label', 'Modo Zen');
    btn.innerHTML = `
      <svg class="icon-zen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0.3"/>
        <path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>
      </svg>
      <svg class="icon-exit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span class="zen-label">ZEN</span>
    `;
    document.body.appendChild(btn);
  }

  attachEventListeners() {
    document.getElementById('zenToggle').addEventListener('click', () => {
      this.toggle();
    });

    // Salir con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.active) this.toggle();
    });
  }

  toggle() {
    this.active = !this.active;
    document.body.classList.toggle('zen-mode', this.active);

    const label = document.querySelector('.zen-label');
    if (label) label.textContent = this.active ? 'SALIR' : 'ZEN';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zenMode = new ZenMode();
  });
} else {
  window.zenMode = new ZenMode();
}