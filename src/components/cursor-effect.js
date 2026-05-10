class CursorEffect {
  constructor() {
    if (window.matchMedia('(hover: none)').matches) return;

    this.mx = -200; this.my = -200; // posición mouse
    this.cx = -200; this.cy = -200; // posición actual

    this.init();
  }

  init() {
    // Crear elementos
    this.dot  = this.el('cursor-dot');
    this.ring = this.el('cursor-ring');
    document.body.append(this.dot, this.ring);

    // Ocultar cursor nativo
    document.documentElement.style.cursor = 'none';

    this.bindEvents();
    this.tick();
  }

  el(cls) {
    const d = document.createElement('div');
    d.className = cls;
    return d;
  }

  bindEvents() {
    // Seguir mouse
    window.addEventListener('mousemove', e => {
      this.mx = e.clientX;
      this.my = e.clientY;
    });

    // Hover en interactivos
    const SEL = 'a,button,input,label,[data-id],.filter-btn,.project-item,.profile-nav-btn,.zen-toggle,.theme-toggle,.welcome-btn,.btn-contact,.btn-social,.skill-chip,.prog-item';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(SEL)) {
        this.dot.classList.add('hovering');
        this.ring.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(SEL)) {
        this.dot.classList.remove('hovering');
        this.ring.classList.remove('hovering');
      }
    });

    // Ripple al click
    window.addEventListener('click', e => this.ripple(e.clientX, e.clientY));

    // Ocultar al salir de ventana
    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity  = '0';
      this.ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      this.dot.style.opacity  = '';
      this.ring.style.opacity = '';
    });
  }

  ripple(x, y) {
    [0, 100].forEach((delay, i) => {
      const r = document.createElement('div');
      r.className = 'cursor-ripple';
      r.style.cssText = `left:${x}px;top:${y}px;animation-delay:${delay}ms;opacity:${i === 0 ? 0.7 : 0.35}`;
      document.body.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  }

  tick() {
    const L = 0.8;
    this.cx += (this.mx - this.cx) * L;
    this.cy += (this.my - this.cy) * L;

    // Dot: centrado restando la mitad de su tamaño
    const dw = this.dot.offsetWidth   || 6;
    const rw = this.ring.offsetWidth  || 32;

    this.dot.style.left  = (this.cx - dw / 2) + 'px';
    this.dot.style.top   = (this.cy - dw / 2) + 'px';
    this.ring.style.left = (this.cx - rw / 2) + 'px';
    this.ring.style.top  = (this.cy - rw / 2) + 'px';

    requestAnimationFrame(() => this.tick());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.cursorEffect = new CursorEffect(); });
} else {
  window.cursorEffect = new CursorEffect();
}