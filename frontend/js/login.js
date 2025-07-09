document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageDiv = document.getElementById('message');

  if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault(); // Previene el envío por defecto del formulario

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          // Limpiar mensajes anteriores
          messageDiv.textContent = '';
          messageDiv.className = 'message-area';

          try {
              // Envía los datos al backend (ruta que crearemos a continuación)
              const response = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password }),
              });

              const data = await response.json();
              console.log(data)

              if (response.ok) {
                messageDiv.textContent = data.message || 'Inicio de sesión exitoso.';
                messageDiv.classList.add('success');
                
                localStorage.setItem('userId', data.userId); // Asegúrate de que tu backend envía el ID del usuario
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.username); // Opcional, para mostrar en el dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                  messageDiv.textContent = data.message || 'Error al iniciar sesión.';
                  messageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor:', error);
              messageDiv.textContent = 'Error de conexión. Inténtalo de nuevo más tarde.';
              messageDiv.classList.add('error');
          }
      });
  }
});
