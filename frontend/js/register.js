document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');

  if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
          e.preventDefault(); // Previene el envío por defecto del formulario

          const fullName = document.getElementById('fullName').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const role = document.getElementById('role').value;

          // Limpiar mensajes anteriores
          messageDiv.textContent = '';
          messageDiv.className = 'message-area'; // Resetear clases

          // Validaciones básicas del lado del cliente
          if (password !== confirmPassword) {
              messageDiv.textContent = 'Las contraseñas no coinciden.';
              messageDiv.classList.add('error');
              return; // Detener el envío
          }

          if (password.length < 6) {
              messageDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
              messageDiv.classList.add('error');
              return;
          }

          if (!role) {
              messageDiv.textContent = 'Por favor, selecciona un tipo de usuario.';
              messageDiv.classList.add('error');
              return;
          }

          try {
              // Envía los datos al backend (ruta que crearemos a continuación)
              const response = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ fullName, email, password, role }),
              });

              let data;
              try {
                  data = await response.json();
              } catch (jsonError) {
                  console.error('Error al parsear la respuesta JSON:', jsonError);
                  data = { message: 'El servidor respondió de forma inesperada.' };
              }


              if (response.ok) {
                  messageDiv.textContent = data.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!';
                  messageDiv.classList.add('success');
                  // Opcional: limpiar el formulario después de un registro exitoso
                  registerForm.reset();
                  // Redirigir al login después de un breve retraso
                  setTimeout(() => {
                      window.location.href = '/login.html';
                  }, 2000);
              } else {
                  messageDiv.textContent = data.message || 'Error en el registro. Inténtalo de nuevo.';
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