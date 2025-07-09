document.addEventListener('DOMContentLoaded', () => {
  // 1. Funcionalidad de Scroll Suave para la navegación
  const navLinks = document.querySelectorAll('.main-nav a');

  navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          // Solo aplicar scroll suave si el enlace es a una sección interna (empieza con '#')
          if (link.hash !== '' && link.hash.startsWith('#')) {
              e.preventDefault(); // Previene el comportamiento por defecto del ancla

              const targetId = link.hash; // Obtiene el ID de la sección objetivo (ej: '#features')
              const targetSection = document.querySelector(targetId);

              if (targetSection) {
                  // Calcula la posición para el scroll, ajustando para un header fijo si lo hubiera
                  const headerOffset = document.querySelector('.main-header') ? document.querySelector('.main-header').offsetHeight : 0;
                  const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerOffset - 20; // -20px para un pequeño margen extra

                  window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth' // Habilita el scroll suave
                  });
              }
          }
      });
  });

  // 2. Manejo Básico del Formulario de Contacto (Simulación)
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
          e.preventDefault(); // Previene el envío real del formulario

          // Simula un "envío"
          alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');

          // Opcional: Limpiar el formulario después de la simulación
          contactForm.reset();
      });
  }

  // Puedes añadir más funcionalidades específicas del index aquí si son necesarias
  // Por ejemplo, animaciones, sliders de imágenes, etc.
});