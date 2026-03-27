class GalleryGrid {
  constructor(containerId = 'grid-container') {
    this.containerId = containerId;
    this.projects = [];
    this.selectedCategory = "TODOS";
    this.hoveredId = null;
    this.baseSize = 80;

    this.particles = {};
    this.animFrame = null;
    this.physicsRunning = false;

    this.ATTRACTION  = 0.0001;
    this.REPULSION   = 50000;
    this.DAMPING     = 0.8;
    this.REST_THRESH = 5.0;
    this.BOUNDARY_PAD = 10;

    this.init();
  }

  async init() {
    await this.loadProjects();
    this.render();
    this.attachEventListeners();
    this.listenToFilterChanges();
  }

  async loadProjects() {
    try {
      const response = await fetch('./src/data/projects.json');
      this.projects = await response.json();
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      this.projects = [];
    }
  }

  getFilteredProjects() {
    if (this.selectedCategory === "TODOS") return this.projects;
    return this.projects.filter(p => p.categories.includes(this.selectedCategory));
  }

  getGridBounds() {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return { w: 480, h: 480 };
    return { w: grid.clientWidth || 480, h: grid.clientHeight || 480 };
  }

  // ─── Physics ───

  initParticles(visibleProjects) {
    const { w, h } = this.getGridBounds();
    const cx = w / 2;
    const cy = h / 2;

    visibleProjects.forEach((project, i) => {
      const size = this.baseSize * project.scale;
      const existing = this.particles[project.id];

      if (existing && existing.visible) {
        existing.visible = true;
        existing.size = size;
      } else {
        const angle = (i / visibleProjects.length) * Math.PI * 2;
        const radius = 60 + Math.random() * 80;
        this.particles[project.id] = {
          x: cx - size / 2 + Math.cos(angle) * radius,
          y: cy - size / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          size,
          visible: true,
        };
      }
    });

    this.projects.forEach(p => {
      if (!visibleProjects.find(vp => vp.id === p.id)) {
        if (this.particles[p.id]) this.particles[p.id].visible = false;
      }
    });
  }

  stepPhysics() {
    const { w, h } = this.getGridBounds();
    const cx = w / 2;
    const cy = h / 2;
    const pad = this.BOUNDARY_PAD;

    const visible = Object.entries(this.particles).filter(([, p]) => p.visible);
    let maxSpeed = 0;

    for (const [idA, pA] of visible) {
      const cAx = pA.x + pA.size / 2;
      const cAy = pA.y + pA.size / 2;

      // Attraction toward center
      pA.vx += (cx - cAx) * this.ATTRACTION;
      pA.vy += (cy - cAy) * this.ATTRACTION;

      // Pairwise repulsion
      for (const [idB, pB] of visible) {
        if (idA >= idB) continue;
        const cBx = pB.x + pB.size / 2;
        const cBy = pB.y + pB.size / 2;

        let rx = cAx - cBx;
        let ry = cAy - cBy;
        let dist = Math.sqrt(rx * rx + ry * ry) || 0.01;

        const minDist = (pA.size + pB.size) / 2 + 4;

        if (dist < minDist) {
          const force = this.REPULSION / (dist * dist);
          const nx = rx / dist;
          const ny = ry / dist;
          pA.vx += nx * force;
          pA.vy += ny * force;
          pB.vx -= nx * force;
          pB.vy -= ny * force;
        }
      }

      // Soft boundary walls
      if (pA.x < pad)                    pA.vx += (pad - pA.x) * 0.3;
      if (pA.y < pad)                    pA.vy += (pad - pA.y) * 0.3;
      if (pA.x + pA.size > w - pad)     pA.vx -= (pA.x + pA.size - (w - pad)) * 0.3;
      if (pA.y + pA.size > h - pad)     pA.vy -= (pA.y + pA.size - (h - pad)) * 0.3;

      pA.vx *= this.DAMPING;
      pA.vy *= this.DAMPING;
      pA.x  += pA.vx;
      pA.y  += pA.vy;

      maxSpeed = Math.max(maxSpeed, Math.abs(pA.vx), Math.abs(pA.vy));
    }

    return maxSpeed;
  }

  applyParticlesToDOM() {
    for (const [id, p] of Object.entries(this.particles)) {
      const el = document.querySelector(`.project-item[data-id="${id}"]`);
      if (!el) continue;
      el.style.left = `${p.x}px`;
      el.style.top  = `${p.y}px`;
    }
  }

  startPhysics(visibleProjects) {
    this.stopPhysics();
    this.initParticles(visibleProjects);
    this.physicsRunning = true;

    const tick = () => {
      if (!this.physicsRunning) return;
      const speed = this.stepPhysics();
      this.applyParticlesToDOM();
      if (speed > this.REST_THRESH) {
        this.animFrame = requestAnimationFrame(tick);
      } else {
        this.physicsRunning = false;
      }
    };

    this.animFrame = requestAnimationFrame(tick);
  }

  stopPhysics() {
    this.physicsRunning = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  nudgeParticles() {
    for (const [, p] of Object.entries(this.particles)) {
      if (!p.visible) continue;
      p.vx += (Math.random() - 0.5) * 2;
      p.vy += (Math.random() - 0.5) * 2;
    }
  }

  // ─── Render ───

  render() {
    let container = document.getElementById(this.containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'grid-container';

      const filtersContainer = document.getElementById('filters-container');
      const cvPanel = document.getElementById('cv-panel');
      const insertAfter = filtersContainer || cvPanel;

      if (insertAfter && insertAfter.parentNode) {
        insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
      }
    }

    container.innerHTML = `
      <div class="gallery-grid">
        ${this.projects.map(project => {
          const size = this.baseSize * project.scale;
          return `
            <div
              class="project-item hidden"
              data-id="${project.id}"
              style="width:${size}px;height:${size}px;left:0;top:0;z-index:10;"
            >
              <div class="project-content">
                <img src="${project.cover}" alt="${project.title}" class="project-cover">
                <div class="project-overlay">
                  <div class="project-tags">
                    ${project.categories.map(cat => `<span class="project-tag">${cat}</span>`).join('')}
                  </div>
                  <h3 class="project-title">${project.title}</h3>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.attachEventListeners();

    setTimeout(() => {
      this.updateVisibility();
      this.startPhysics(this.getFilteredProjects());
    }, 80);
  }

  updateVisibility() {
    const filtered = this.getFilteredProjects();
    const visibleIds = new Set(filtered.map(p => p.id));

    document.querySelectorAll('.project-item').forEach(el => {
      const id = parseInt(el.dataset.id);
      if (visibleIds.has(id)) {
        el.classList.add('visible');
        el.classList.remove('hidden');
      } else {
        el.classList.remove('visible');
        el.classList.add('hidden');
      }
    });
  }

  // ─── Events ───

  attachEventListeners() {
    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        this.hoveredId = parseInt(e.currentTarget.dataset.id);
        e.currentTarget.classList.add('hovered');
        e.currentTarget.style.zIndex = 50;
      });

      item.addEventListener('mouseleave', (e) => {
        this.hoveredId = null;
        e.currentTarget.classList.remove('hovered');
        e.currentTarget.style.zIndex = 10;
      });

      item.addEventListener('click', (e) => {
        const projectId = parseInt(e.currentTarget.dataset.id);
        this.handleProjectClick(projectId);
      });
    });
  }

  listenToFilterChanges() {
    document.addEventListener('filterChanged', (e) => {
      this.selectedCategory = e.detail.category;
      this.updateGallery();
    });
  }

  updateGallery() {
    this.updateVisibility();
    const filtered = this.getFilteredProjects();

    this.projects.forEach(p => {
      if (this.particles[p.id]) {
        this.particles[p.id].visible = filtered.some(fp => fp.id === p.id);
      }
    });

    this.nudgeParticles();
    this.startPhysics(filtered);
  }

  handleProjectClick(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    document.dispatchEvent(new CustomEvent('projectSelected', {
      detail: { project }
    }));
  }

  getProjects() {
    return this.projects;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.galleryGrid = new GalleryGrid();
  });
} else {
  window.galleryGrid = new GalleryGrid();
}