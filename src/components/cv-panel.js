// Panel de CV
class CVPanel {
  constructor() {
    this.currentCategory = "TODOS";
    this.cvData = null;
    
    this.init();
  }

  async init() {
    await this.loadCVData();
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

  getCurrentCVData() {
    if (!this.cvData) return null;
    return this.cvData[this.currentCategory] || null;
  }

  render() {
    const cvContainer = document.getElementById('cv-panel');
    if (!cvContainer) {
      console.error('No se encontró el contenedor cv-panel');
      return;
    }

    const data = this.getCurrentCVData();
    
    console.log('Renderizando CV para categoría:', this.currentCategory, 'Datos:', data);
    
    if (!data) {
      cvContainer.innerHTML = '<div class="cv-empty">No hay información disponible</div>';
      return;
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

    // Botón de descarga EDITAR
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

    cvContainer.innerHTML = `
      <div class="cv-content">
        ${sectionsHTML}
      </div>
    `;
  }

  updateCategory(category) {
    console.log('Actualizando CV a categoría:', category);
    this.currentCategory = category;
    this.render();
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