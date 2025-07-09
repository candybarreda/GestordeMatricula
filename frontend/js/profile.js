// frontend/js/profile.js
document.addEventListener('DOMContentLoaded', async () => {
  const userIdInput = document.getElementById('userId');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const roleInput = document.getElementById('role');
  const profileForm = document.getElementById('profileForm');
  const profileMessageDiv = document.getElementById('profileMessage');

  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  const passwordForm = document.getElementById('passwordForm');
  const passwordMessageDiv = document.getElementById('passwordMessage');

  // --- Función para cargar los datos del perfil del usuario logueado ---
  async function fetchUserProfile() {
      profileMessageDiv.textContent = 'Cargando perfil...';
      profileMessageDiv.className = 'message-area info';

      try {
          const response = await fetch('/api/auth/profile');
          const data = await response.json();

          if (response.ok) {
              profileMessageDiv.textContent = ''; // Limpiar mensaje
              profileMessageDiv.className = 'message-area';

              userIdInput.value = data.id;
              usernameInput.value = data.username;
              emailInput.value = data.email;
              roleInput.value = data.role; // El rol es solo de lectura
          } else {
              profileMessageDiv.textContent = data.message || 'Error al cargar el perfil.';
              profileMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener el perfil:', error);
          profileMessageDiv.textContent = 'Error de conexión. No se pudo cargar el perfil.';
          profileMessageDiv.classList.add('error');
      }
  }

  // --- Manejar el envío del formulario de actualización de perfil ---
  if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          profileMessageDiv.textContent = 'Guardando cambios...';
          profileMessageDiv.className = 'message-area info';

          const id = userIdInput.value;
          const username = usernameInput.value;
          const email = emailInput.value;

          try {
              const response = await fetch(`/api/auth/profile`, { // No se usa el ID en la URL para PUT, ya que se actualiza el perfil del usuario logueado
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ id: parseInt(id), username, email }), // Enviar el ID para encontrarlo en el backend
              });

              const data = await response.json();

              if (response.ok) {
                  profileMessageDiv.textContent = data.message || 'Perfil actualizado con éxito.';
                  profileMessageDiv.classList.add('success');
                  // Opcional: Volver a cargar el perfil para asegurar que los datos estén actualizados
                  fetchUserProfile();
              } else {
                  profileMessageDiv.textContent = data.message || 'Error al actualizar el perfil.';
                  profileMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al actualizar el perfil:', error);
              profileMessageDiv.textContent = 'Error de conexión. No se pudo actualizar el perfil.';
              profileMessageDiv.classList.add('error');
          }
      });
  }

  // --- Manejar el envío del formulario de cambio de contraseña ---
  if (passwordForm) {
      passwordForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          passwordMessageDiv.textContent = 'Cambiando contraseña...';
          passwordMessageDiv.className = 'message-area info';

          const currentPassword = currentPasswordInput.value;
          const newPassword = newPasswordInput.value;
          const confirmNewPassword = confirmNewPasswordInput.value;

          if (newPassword !== confirmNewPassword) {
              passwordMessageDiv.textContent = 'La nueva contraseña y la confirmación no coinciden.';
              passwordMessageDiv.classList.add('error');
              return;
          }

          try {
              const response = await fetch('/api/auth/profile/password', {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ currentPassword, newPassword }),
              });

              const data = await response.json();

              if (response.ok) {
                  passwordMessageDiv.textContent = data.message || 'Contraseña actualizada con éxito.';
                  passwordMessageDiv.classList.add('success');
                  passwordForm.reset(); // Limpiar formulario
              } else {
                  passwordMessageDiv.textContent = data.message || 'Error al cambiar la contraseña.';
                  passwordMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al cambiar contraseña:', error);
              passwordMessageDiv.textContent = 'Error de conexión. No se pudo cambiar la contraseña.';
              passwordMessageDiv.classList.add('error');
          }
      });
  }

  // Cargar los datos del perfil al inicio
  fetchUserProfile();
});