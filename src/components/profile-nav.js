/**
 * ProfileNav
 * Carga datos desde ./src/data/skills.json
 */

class ProfileNav {
  constructor() {
    this.activeSection = null;
    this.isOpen = false;
    this.data = null;
    this.init();
  }

  async init() {
    try {
      const res = await fetch('./src/data/skills.json');
      this.data = await res.json();
    } catch (e) {
      console.error('Error cargando skills.json:', e);
      return;
    }
    this.renderNav();
    this.renderPanel();
    this.renderBackdrop();
    this.attachEventListeners();
  }

  // ── Render Nav ───────────────────────────────────────

  renderNav() {
    const nav = document.createElement('nav');
    nav.className = 'profile-nav';
    nav.innerHTML = `
      <div class="profile-nav-inner">
        <button class="profile-nav-btn" data-section="sobre">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Sobre mí
        </button>
        <button class="profile-nav-btn" data-section="stack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          Habilidades
        </button>
      </div>
    `;
    document.body.appendChild(nav);
    this.nav = nav;
  }

  // ── Render Panel ─────────────────────────────────────

  renderPanel() {
    const panel = document.createElement('div');
    panel.className = 'profile-panel';
    panel.id = 'profilePanel';
    panel.innerHTML = `
      <div class="profile-panel-header">
        <span class="profile-panel-title" id="profilePanelTitle">—</span>
        <button class="profile-panel-close" id="profilePanelClose" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="profile-panel-body" id="profilePanelBody">
        <div class="profile-section" id="profile-sobre">${this.buildSobre()}</div>
        <div class="profile-section" id="profile-stack">${this.buildStack()}</div>
      </div>
    `;
    document.body.appendChild(panel);
    this.panel = panel;
  }

  renderBackdrop() {
    const bd = document.createElement('div');
    bd.className = 'profile-backdrop';
    bd.id = 'profileBackdrop';
    document.body.appendChild(bd);
    this.backdrop = bd;
  }

  // ── Builders ─────────────────────────────────────────

  buildSobre() {
    const s = this.data.sobre;
    const bioHtml = s.bio.replace(/\n\n/g, '<br><br>');
    return `
      <div class="profile-bio-header">
        <div class="profile-avatar">${s.nombre.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
        <div class="profile-bio-meta">
          <span class="profile-bio-name">${s.nombre}</span>
          <span class="profile-bio-role">${s.rol}</span>
        </div>
      </div>

      <div>
        <p class="profile-block-label">Bio</p>
        <p class="profile-bio-text">${bioHtml}</p>
      </div>

      <div>
        <p class="profile-block-label">Intereses</p>
        <div class="profile-tags">
          ${s.intereses.map(i => `<span class="profile-tag">${i}</span>`).join('')}
        </div>
      </div>

      <div>
        <p class="profile-block-label">Ubicación</p>
        <p class="profile-bio-text">${s.ubicacion}</p>
      </div>
    `;
  }

  buildStack() {
    const grupos = this.data.habilidades.map(g => `
      <div class="skill-group">
        <p class="skill-group-label">${g.grupo}</p>
        ${g.items.map(item => `
          <div class="skill-item">
            <div class="skill-item-header">
              <span class="skill-name">${item.nombre}</span>
              <span class="skill-level">${item.nivel}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-bar-fill" style="--w:${item.pct}%"></div>
            </div>
          </div>
        `).join('')}
        ${g.chips.length ? `
          <div>
            <p class="profile-block-label" style="margin-top:8px">Tecnologías</p>
            <div class="skill-chips">
              ${g.chips.map(c => `<span class="skill-chip">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <hr class="profile-divider"/>
    `).join('');

    const programas = this.data.programas.map(cat => `
      <div class="prog-category">
        <p class="profile-block-label">${cat.categoria}</p>
        <div class="prog-grid">
          ${cat.items.map(p => `
            <div class="prog-item">
              <img src="${p.logo}" alt="${p.nombre}" class="prog-logo" onerror="this.style.display='none'">
              <span class="prog-name">${p.nombre}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      ${grupos}
      <div class="prog-section">
        <p class="skill-group-label">Programas</p>
        ${programas}
      </div>
    `;
  }

  // ── Eventos ──────────────────────────────────────────

  attachEventListeners() {
    this.nav.querySelectorAll('.profile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (this.isOpen && this.activeSection === section) {
          this.close();
        } else {
          this.open(section);
        }
      });
    });

    document.getElementById('profilePanelClose').addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  // ── Abrir / Cerrar ───────────────────────────────────

  open(section) {
    this.activeSection = section;
    this.isOpen = true;

    this.nav.querySelectorAll('.profile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    const titles = { sobre: 'Sobre mí', stack: 'Habilidades' };
    document.getElementById('profilePanelTitle').textContent = titles[section] || section;

    document.querySelectorAll('.profile-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`profile-${section}`);
    if (target) target.classList.add('active');

    document.getElementById('profilePanelBody').scrollTop = 0;

    // Ocultar contenido principal con clase para no pisar estilos inline
    const main = document.querySelector('.parent');
    if (main) {
      main.style.transition = 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      main.classList.add('panel-hidden');
    }

    this.backdrop.classList.add('visible');
    this.panel.classList.add('open');

    if (section === 'stack') {
      setTimeout(() => this.animateSkillBars(), 300);
    }
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.activeSection = null;

    this.nav.querySelectorAll('.profile-nav-btn').forEach(b => b.classList.remove('active'));
    this.panel.classList.remove('open');
    this.backdrop.classList.remove('visible');
    document.querySelectorAll('.skill-bar-fill').forEach(b => b.classList.remove('animated'));

    // Esperar a que el panel termine de cerrarse antes de revelar
    setTimeout(() => this.revealPage(), 400);
  }

  revealPage() {
    const main = document.querySelector('.parent');
    if (!main) return;

    // Si zen está activo, solo limpiar clases sin revelar
    if (document.body.classList.contains('zen-mode')) {
      main.classList.remove('panel-hidden');
      main.style.cssText = '';
      return;
    }

    const selectors = [
      'header .title-section h1',
      'header .title-section h2',
      'header .title-section .contact-info',
      'header .title-section .header-actions',
      '.filters-container',
      '.grid-container',
      '.info-section',
    ];

    // 1. Preparar todos los hijos en opacity:0 sin transición,
    //    mientras el contenedor sigue invisible (panel-hidden intacto)
    selectors.forEach(selector => {
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
    });

    // 2. Un solo frame para que el browser registre el estado inicial
    requestAnimationFrame(() => {
      // 3. Hacer visible el contenedor sin transición propia
      //    (los hijos están en 0 así que no hay flash)
      main.style.transition = 'none';
      main.style.opacity = '1';
      main.classList.remove('panel-hidden');

      // 4. Animar hijos en secuencia en el siguiente frame
      requestAnimationFrame(() => {
        main.style.transition = '';
        main.style.opacity = '';

        selectors.forEach((selector, i) => {
          const el = document.querySelector(selector);
          if (!el) return;
          setTimeout(() => {
            el.style.transition = 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
            el.style.opacity = '';
            el.style.transform = '';
          }, i * 90);
        });
      });
    });
  }

  animateSkillBars() {
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
      bar.classList.add('animated');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.profileNav = new ProfileNav(); });
} else {
  window.profileNav = new ProfileNav();
}