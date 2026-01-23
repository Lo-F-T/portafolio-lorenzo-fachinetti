// Panel de CV
class CVPanel {
  constructor() {
    this.currentCategory = "TODOS";
    this.cvData = null;
    this.isTransitioning = false;
    
    this.init();
  }

  async init() {
    await this.loadCVData();
    this.setupContainer();
    this.render();
    this.attachEventListeners();
    console.log('CV Panel inicializado con categoría:', this.currentCategory);
  }

  async loadCVData() {
    try {
      const response = await fetch('./src/data/cv.json');
      this.cvData = await response.json();
    } catch (error) {
      console.error('Error cargando datos de CV:', error);
      this.cvData = {};
    }
  }

  setupContainer() {
    const cvPanel = document.getElementById('cv-panel');
    if (!cvPanel) {
      console.error('No se encontró el contenedor cv-panel');
      return;
    }

    // Crear estructura fija del contenedor
    cvPanel.innerHTML = `
      <div class="cv-content">
        <div class="cv-inner"></div>
      </div>
    `;
  }

  getCurrentCVData() {
    if (!this.cvData) return null;
    return this.cvData[this.currentCategory] || null;
  }

  buildContent() {
    const data = this.getCurrentCVData();
    
    if (!data) {
      return '<div class="cv-empty">No hay información disponible</div>';
    }

    let sectionsHTML = '';

    // Imagen de perfil
    if (data.imagen) {
      sectionsHTML += `
        <div class="cv-section cv-profile">
          <img src="${data.imagen}" alt="Perfil" class="cv-profile-image">
        </div>
      `;
    }

    // Botón de descarga
    if (data.descargar) {
      sectionsHTML += `
        <div class="cv-section cv-download">
          <a href="${data.descargar}" download class="cv-download-btn">
            Descargar CV
          </a>
        </div>
      `;
    }

    // Acerca de mí
    if (data.acerca) {
      sectionsHTML += `
        <div class="cv-section">
          <h3 class="cv-section-title">Acerca de mí</h3>
          <p class="cv-text">${data.acerca}</p>
        </div>
      `;
    }

    // Estudios
    if (data.estudios && data.estudios.length > 0) {
      sectionsHTML += `
        <div class="cv-section">
          <h3 class="cv-section-title">Estudios</h3>
          <div class="cv-list">
            ${data.estudios.map(estudio => `
              <div class="cv-item">
                <div class="cv-item-header">
                  <h4 class="cv-item-title">${estudio.titulo}</h4>
                  <span class="cv-item-period">${estudio.periodo}</span>
                </div>
                <p class="cv-item-subtitle">${estudio.institucion}</p>
                ${estudio.descripcion ? `<p class="cv-item-description">${estudio.descripcion}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Empleos
    if (data.empleos && data.empleos.length > 0) {
      sectionsHTML += `
        <div class="cv-section">
          <h3 class="cv-section-title">Experiencia</h3>
          <div class="cv-list">
            ${data.empleos.map(empleo => `
              <div class="cv-item">
                <div class="cv-item-header">
                  <h4 class="cv-item-title">${empleo.puesto}</h4>
                  <span class="cv-item-period">${empleo.periodo}</span>
                </div>
                <p class="cv-item-subtitle">${empleo.empresa}</p>
                ${empleo.descripcion ? `<p class="cv-item-description">${empleo.descripcion}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Habilidades
    if (data.habilidades && data.habilidades.length > 0) {
      sectionsHTML += `
        <div class="cv-section">
          <h3 class="cv-section-title">Habilidades</h3>
          <div class="cv-skills-grid">
            ${data.habilidades.map(skill => `
              <div class="cv-skill-item">
                <img src="${skill.imagen}" alt="${skill.nombre}" class="cv-skill-image">
                <span class="cv-skill-name">${skill.nombre}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return sectionsHTML;
  }

  render(animated = false) {
    const cvInner = document.querySelector('.cv-inner');
    if (!cvInner) {
      console.error('No se encontró el contenedor cv-inner');
      return;
    }

    console.log('Renderizando CV para categoría:', this.currentCategory);
    
    const newContent = this.buildContent();

    if (animated) {
      // Fade out
      cvInner.style.opacity = '0';
      cvInner.style.transform = 'translateY(-15px)';
      
      setTimeout(() => {
        cvInner.innerHTML = newContent;
        
        // Reset scroll position
        const cvContent = document.querySelector('.cv-content');
        if (cvContent) cvContent.scrollTop = 0;
        
        // Fade in
        requestAnimationFrame(() => {
          cvInner.style.opacity = '1';
          cvInner.style.transform = 'translateY(0)';
        });
        
        // Animar secciones individuales
        setTimeout(() => {
          this.animateItems(cvInner);
        }, 50);
      }, 300);
    } else {
      // Primera carga sin animación
      cvInner.innerHTML = newContent;
      
      // Pequeño delay para primera animación
      setTimeout(() => {
        this.animateItems(cvInner);
      }, 100);
    }
  }

  animateItems(container) {
    const sections = container.querySelectorAll('.cv-section');
    
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateX(-10px)';
      
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateX(0)';
      }, index * 60);
    });
  }

  async updateCategory(category) {
    if (this.isTransitioning || category === this.currentCategory) return;
    
    console.log('Actualizando CV a categoría:', category);
    this.isTransitioning = true;
    this.currentCategory = category;
    
    this.render(true);
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  attachEventListeners() {
    document.addEventListener('categoryChanged', (e) => {
      this.updateCategory(e.detail.category);
    });
  }
}

let cvPanelInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  cvPanelInstance = new CVPanel();
});