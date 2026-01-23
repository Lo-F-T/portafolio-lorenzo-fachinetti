class GalleryGrid {
  constructor(containerId = 'grid-container') {
    this.containerId = containerId;
    this.projects = [];
    this.selectedCategory = "TODOS";
    this.hoveredId = null;
    this.baseSize = 80;
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

    const filteredProjects = this.getFilteredProjects();
    
    container.innerHTML = `
      <div class="gallery-grid">
        ${this.projects.map((project, index) => {
          const isVisible = this.selectedCategory === "TODOS" || project.categories.includes(this.selectedCategory);
          const visibleIndex = filteredProjects.findIndex(p => p.id === project.id);
          const pos = visibleIndex >= 0 ? this.getPosition(visibleIndex) : this.getPosition(0);
          const size = this.baseSize * project.scale;
          
          const offsetX = (pos.col - 1) * this.baseSize;
          const offsetY = (pos.row - 1) * this.baseSize;

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

    this.attachEventListeners();
    
    setTimeout(() => this.centerVisibleProjects(), 100);
  }

  attachEventListeners() {
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
  }

  listenToFilterChanges() {
    document.addEventListener('filterChanged', (e) => {
      this.selectedCategory = e.detail.category;
      this.updateGallery();
    });
  }

  updateGallery() {
    const filteredProjects = this.getFilteredProjects();
    
    document.querySelectorAll('.project-item').forEach((item) => {
      const projectId = parseInt(item.dataset.id);
      const project = this.projects.find(p => p.id === projectId);
      const isVisible = this.selectedCategory === "TODOS" || project.categories.includes(this.selectedCategory);
      const visibleIndex = filteredProjects.findIndex(p => p.id === projectId);
      
      if (isVisible && visibleIndex >= 0) {
        const pos = this.getPosition(visibleIndex);
        
        const offsetX = (pos.col - 1) * this.baseSize;
        const offsetY = (pos.row - 1) * this.baseSize;

        item.style.left = `${offsetX}px`;
        item.style.top = `${offsetY}px`;
        
        item.classList.add('visible');
        item.classList.remove('hidden');
      } else {
        item.classList.remove('visible');
        item.classList.add('hidden');
      }
    });

    this.centerVisibleProjects();
  }

  centerVisibleProjects() {
    const visibleItems = document.querySelectorAll('.project-item.visible');
    if (visibleItems.length === 0) return;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    visibleItems.forEach(item => {
      const left = parseFloat(item.style.left);
      const top = parseFloat(item.style.top);
      const width = parseFloat(item.style.width);
      const height = parseFloat(item.style.height);

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    const gridSize = 480;
    const offsetX = (gridSize - groupWidth) / 2 - minX;
    const offsetY = (gridSize - groupHeight) / 2 - minY;

    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
      galleryGrid.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
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