// Galería de Portafolio
class PortfolioGallery {
  constructor() {
    this.selectedCategory = "TODOS";
    this.hoveredId = null;
    this.selectedProject = null;
    this.projects = [];
    this.categories = ["TODOS", "ARQUITECTURA", "DISEÑO", "DESARROLLO"];
    
    this.init();
  }

  async init() {
    await this.loadProjects();
    this.render();
    this.attachEventListeners();
  }

  async loadProjects() {
    try {
      const response = await fetch('../src/data/projects.json');
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

  getPosition(index) {
    const positions = [
      { row: 1, col: 2 },
      { row: 1, col: 5 },
      { row: 2, col: 1 },
      { row: 2, col: 4 },
      { row: 3, col: 3 },
      { row: 3, col: 6 },
      { row: 4, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 1 },
      { row: 5, col: 4 },
      { row: 6, col: 3 },
      { row: 6, col: 6 }
    ];
    
    return positions[index % positions.length];
  }

  render() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '';

    const filtersHTML = `
      <div class="gallery-filters">
        ${this.categories.map(cat => `
          <button 
            class="filter-btn ${this.selectedCategory === cat ? 'active' : ''}" 
            data-category="${cat}"
          >
            ${cat}
          </button>
        `).join('')}
      </div>
    `;

    // grilla de proyectos
    const baseSize = 80;
    const filteredProjects = this.getFilteredProjects();
    
    const gridHTML = `
      <div class="gallery-grid">
        ${this.projects.map((project, index) => {
          const isVisible = this.selectedCategory === "TODOS" || project.categories.includes(this.selectedCategory);
          const visibleIndex = filteredProjects.findIndex(p => p.id === project.id);
          const pos = visibleIndex >= 0 ? this.getPosition(visibleIndex) : this.getPosition(0);
          const size = baseSize * project.scale;
          
          const offsetX = (pos.col - 1) * baseSize;
          const offsetY = (pos.row - 1) * baseSize;

          return `
            <div 
              class="project-item ${isVisible ? 'visible' : 'hidden'}" 
              data-id="${project.id}"
              style="
                width: ${size}px;
                height: ${size}px;
                left: ${offsetX}px;
                top: ${offsetY}px;
              "
            >
              <div class="project-content">
                <img src="${project.cover}" alt="${project.title}" class="project-cover">
                <div class="project-overlay">
                  <div class="project-tags">
                    ${project.categories.map(cat => `
                      <span class="project-tag">${cat}</span>
                    `).join('')}
                  </div>
                  <h3 class="project-title">${project.title}</h3>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Panel lateral
    const detailsPanel = `
      <div class="details-panel" id="details-panel">
        <div class="details-content">
          <button class="close-details" id="close-details">×</button>
          <div id="details-inner"></div>
        </div>
      </div>
    `;

    galleryContainer.innerHTML = filtersHTML + gridHTML + detailsPanel;
  }

  attachEventListeners() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedCategory = e.target.dataset.category;
        this.updateGallery();
        //esto es para cv-panel
        document.dispatchEvent(new CustomEvent('categoryChanged', {
          detail: { category: this.selectedCategory }
        }));
      });
    });

    // acciones de proyecto
    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('mouseenter', (e) => {
        this.hoveredId = parseInt(e.currentTarget.dataset.id);
        e.currentTarget.classList.add('hovered');
      });

      item.addEventListener('mouseleave', (e) => {
        this.hoveredId = null;
        e.currentTarget.classList.remove('hovered');
      });

      item.addEventListener('click', (e) => {
        const projectId = parseInt(e.currentTarget.dataset.id);
        this.handleProjectClick(projectId);
      });
    });

    // cerrar panel
    const closeBtn = document.getElementById('close-details');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDetailsPanel();
      });
    }
  }

  updateGallery() {
    // categorias de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.category === this.selectedCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // actualizar cv
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { category: this.selectedCategory }
    }));

    // actualizar grilla
    const filteredProjects = this.getFilteredProjects();
    const baseSize = 80;
    
    document.querySelectorAll('.project-item').forEach((item) => {
      const projectId = parseInt(item.dataset.id);
      const project = this.projects.find(p => p.id === projectId);
      const isVisible = this.selectedCategory === "TODOS" || project.categories.includes(this.selectedCategory);
      const visibleIndex = filteredProjects.findIndex(p => p.id === projectId);
      
      if (isVisible && visibleIndex >= 0) {
        const pos = this.getPosition(visibleIndex);
        
        const offsetX = (pos.col - 1) * baseSize;
        const offsetY = (pos.row - 1) * baseSize;

        item.style.left = `${offsetX}px`;
        item.style.top = `${offsetY}px`;
        
        item.classList.add('visible');
        item.classList.remove('hidden');
      } else {
        item.classList.remove('visible');
        item.classList.add('hidden');
      }
    });
  }

  handleProjectClick(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    this.selectedProject = project;
    this.openDetailsPanel(project);
  }

  openDetailsPanel(project) {
    const panel = document.getElementById('details-panel');
    const galleryContainer = document.getElementById('gallery-container');
    const detailsInner = document.getElementById('details-inner');
    
    if (!panel || !galleryContainer || !detailsInner) return;

    // contenido del panel
    const images = project.images || [];
    detailsInner.innerHTML = `
      <h2 class="detail-title">${project.title}</h2>
      <div class="detail-tags">
        ${project.categories.map(cat => `
          <span class="detail-tag">${cat}</span>
        `).join('')}
      </div>
      ${images.length > 0 ? `
        <div class="carousel-container">
          <div class="carousel-wrapper">
            ${images.map((img, index) => `
              <img src="${img}" 
                   alt="${project.title}" 
                   class="carousel-image ${index === 0 ? 'active' : ''}"
                   data-index="${index}">
            `).join('')}
          </div>
          <button class="carousel-btn prev" id="carousel-prev">‹</button>
          <button class="carousel-btn next" id="carousel-next">›</button>
          <div class="carousel-dots">
            ${images.map((_, index) => `
              <span class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="single-image-container">
          <img src="${project.cover}" alt="${project.title}" class="detail-image">
        </div>
      `}
      <div class="detail-description">
        <p>Proyecto de ${project.categories.join(' y ').toLowerCase()} que combina diseño y funcionalidad.</p>
      </div>
    `;

    // Activar el panel y ajustar el grid
    panel.classList.add('active');
    galleryContainer.classList.add('panel-open');

    // Inicializar carrusel si hay imágenes
    if (images.length > 0) {
      this.initCarousel(images.length);
    }
  }

  initCarousel(totalImages) {
    let currentIndex = 0;

    const updateCarousel = (newIndex) => {
      currentIndex = newIndex;
      
      // Actualizar imágenes
      document.querySelectorAll('.carousel-image').forEach((img, index) => {
        img.classList.toggle('active', index === currentIndex);
      });

      document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };

    const prevBtn = document.getElementById('carousel-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
        updateCarousel(newIndex);
      });
    }

    const nextBtn = document.getElementById('carousel-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
        updateCarousel(newIndex);
      });
    }

    document.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        updateCarousel(index);
      });
    });

    // Navegación con teclado
    const handleKeyboard = (e) => {
      if (!document.getElementById('details-panel').classList.contains('active')) return;
      
      if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn.click();
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    const originalClose = this.closeDetailsPanel.bind(this);
    this.closeDetailsPanel = () => {
      document.removeEventListener('keydown', handleKeyboard);
      originalClose();
      this.closeDetailsPanel = originalClose;
    };
  }

  closeDetailsPanel() {
    const panel = document.getElementById('details-panel');
    const galleryContainer = document.getElementById('gallery-container');
    
    if (!panel || !galleryContainer) return;

    panel.classList.remove('active');
    galleryContainer.classList.remove('panel-open');
    this.selectedProject = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const gallery = new PortfolioGallery();
  
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { category: 'TODOS' }
    }));
  }, 100);
});