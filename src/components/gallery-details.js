class GalleryDetails {
  constructor(containerId = 'details-container') {
    this.containerId = containerId;
    this.selectedProject = null;
    this.currentCarouselIndex = 0;
    this.carouselKeyboardHandler = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.listenToProjectSelection();
  }

  render() {
    let container = document.getElementById(this.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'details-container';
      
      const parent = document.querySelector('.parent');
      if (parent) {
        parent.appendChild(container);
      }
    }

    container.innerHTML = `
      <div class="details-panel" id="details-panel">
        <div class="details-content">
          <button class="close-details" id="close-details">×</button>
          <div id="details-inner"></div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const closeBtn = document.getElementById('close-details');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDetailsPanel();
      });
    }
  }

  listenToProjectSelection() {
    document.addEventListener('projectSelected', (e) => {
      this.selectedProject = e.detail.project;
      this.openDetailsPanel(e.detail.project);
    });
  }

  openDetailsPanel(project) {
    const panel = document.getElementById('details-panel');
    const gridContainer = document.getElementById('grid-container');
    const detailsInner = document.getElementById('details-inner');
    
    if (!panel || !detailsInner) return;

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

    panel.classList.add('active');
    if (gridContainer) {
      gridContainer.classList.add('panel-open');
    }

    if (images.length > 0) {
      this.initCarousel(images.length);
    }
  }

  initCarousel(totalImages) {
    this.currentCarouselIndex = 0;

    const updateCarousel = (newIndex) => {
      this.currentCarouselIndex = newIndex;
      
      document.querySelectorAll('.carousel-image').forEach((img, index) => {
        img.classList.toggle('active', index === this.currentCarouselIndex);
      });

      document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentCarouselIndex);
      });
    };

    const prevBtn = document.getElementById('carousel-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const newIndex = this.currentCarouselIndex > 0 
          ? this.currentCarouselIndex - 1 
          : totalImages - 1;
        updateCarousel(newIndex);
      });
    }

    const nextBtn = document.getElementById('carousel-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newIndex = this.currentCarouselIndex < totalImages - 1 
          ? this.currentCarouselIndex + 1 
          : 0;
        updateCarousel(newIndex);
      });
    }

    document.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        updateCarousel(index);
      });
    });

    this.carouselKeyboardHandler = (e) => {
      const panel = document.getElementById('details-panel');
      if (!panel || !panel.classList.contains('active')) return;
      
      if (e.key === 'ArrowLeft') {
        prevBtn?.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn?.click();
      } else if (e.key === 'Escape') {
        this.closeDetailsPanel();
      }
    };

    document.addEventListener('keydown', this.carouselKeyboardHandler);
  }

  closeDetailsPanel() {
    const panel = document.getElementById('details-panel');
    const gridContainer = document.getElementById('grid-container');
    
    if (!panel) return;

    panel.classList.remove('active');
    
    if (gridContainer) {
      gridContainer.classList.remove('panel-open');
    }
    
    this.selectedProject = null;

    if (this.carouselKeyboardHandler) {
      document.removeEventListener('keydown', this.carouselKeyboardHandler);
      this.carouselKeyboardHandler = null;
    }
  }

  getSelectedProject() {
    return this.selectedProject;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.galleryDetails = new GalleryDetails();
  });
} else {
  window.galleryDetails = new GalleryDetails();
}