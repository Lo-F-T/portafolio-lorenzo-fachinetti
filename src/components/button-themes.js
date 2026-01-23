
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  if (!themeToggle) {
    console.error('No se encontró el botón con id="themeToggle"');
    return;
  }
  
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (currentTheme === 'light') {
    html.setAttribute('data-theme', 'light');
  }
  
  console.log('Tema inicial:', currentTheme);
  
  themeToggle.addEventListener('click', function(e) {
    location.reload();
    e.preventDefault();
    e.stopPropagation();
    
    const isDark = !html.hasAttribute('data-theme') || html.getAttribute('data-theme') === 'dark';
    
    console.log('Click detectado. Tema actual:', isDark ? 'dark' : 'light'); // Para debug
    
    if (isDark) {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      console.log('Cambiado a tema claro');
    } else {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      console.log('Cambiado a tema oscuro');
    }
  });
  
  themeToggle.style.pointerEvents = 'auto';
  themeToggle.style.cursor = 'pointer';
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        html.removeAttribute('data-theme');
      } else {
        html.setAttribute('data-theme', 'light');
      }
    }
  });
  
  console.log('Sistema de temas inicializado correctamente');
});
