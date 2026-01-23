class GalleryFilters {
  constructor(containerId = 'filters-container') {
    this.containerId = containerId;
    this.categories = ["TODOS", "ARQUITECTURA", "DISEÑO", "DESARROLLO"];
    this.selectedCategory = "TODOS";
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    let container = document.getElementById(this.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'filters-container';
      
      const cvPanel = document.getElementById('cv-panel');
      if (cvPanel && cvPanel.parentNode) {
        cvPanel.parentNode.insertBefore(container, cvPanel.nextSibling);
      }
    }

    container.innerHTML = `
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

    this.attachEventListeners();
  }

  attachEventListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleFilterChange(e.target.dataset.category);
      });
    });
  }

  handleFilterChange(category) {
    this.selectedCategory = category;
    this.updateActiveButton();
    
    document.dispatchEvent(new CustomEvent('filterChanged', {
      detail: { category: this.selectedCategory }
    }));

    document.dispatchEvent(new CustomEvent('categoryChanged', {
      detail: { category: this.selectedCategory }
    }));
  }

  updateActiveButton() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.category === this.selectedCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  getSelectedCategory() {
    return this.selectedCategory;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.galleryFilters = new GalleryFilters();
  });
} else {
  window.galleryFilters = new GalleryFilters();
}