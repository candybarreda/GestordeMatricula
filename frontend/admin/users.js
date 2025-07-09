// frontend/js/admin/users.js
document.addEventListener('DOMContentLoaded', () => {
  const usersTableBody = document.getElementById('usersTableBody');
  const usersListMessageDiv = document.getElementById('usersListMessage');

  // --- Variables para el formulario de edición (Modal) ---
  const editUserModal = document.getElementById('editUserModal');
  const editUserForm = document.getElementById('editUserForm');
  const editUserId = document.getElementById('editUserId');
  const editUserName = document.getElementById('editUserName');
  const editUserEmail = document.getElementById('editUserEmail');
  const editUserRole = document.getElementById('editUserRole');
  const editUserMessageDiv = document.getElementById('editUserMessage');


  // Función para obtener y mostrar usuarios
  async function fetchUsers() {
      usersListMessageDiv.textContent = 'Cargando usuarios...';
      usersListMessageDiv.className = 'message-area info';

      try {
          const response = await fetch('/api/admin/users');
          const data = await response.json();

          if (response.ok) {
              usersTableBody.innerHTML = ''; // Limpiar tabla
              if (data.length === 0) {
                  usersListMessageDiv.textContent = 'No hay usuarios registrados aún.';
                  usersListMessageDiv.classList.add('info');
              } else {
                  usersListMessageDiv.textContent = '';
                  usersListMessageDiv.className = 'message-area';
                  data.forEach(user => {
                      const row = usersTableBody.insertRow();
                      row.dataset.id = user.id;
                      row.insertCell().textContent = user.id;
                      row.insertCell().textContent = user.username;
                      row.insertCell().textContent = user.email;
                      row.insertCell().textContent = user.role;

                      const actionsCell = row.insertCell();
                      // Por ahora, solo ver. Después añadiremos editar y eliminar.
                      actionsCell.innerHTML = `
                          <button class="btn btn-sm btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i> Editar</button>
                          <button class="btn btn-sm btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i> Eliminar</button>
                      `;
                  });
              }
          } else {
              usersListMessageDiv.textContent = data.message || 'Error al cargar usuarios.';
              usersListMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener usuarios:', error);
          usersListMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los usuarios.';
          usersListMessageDiv.classList.add('error');
      }
  }

  // --- Manejo de la tabla de usuarios (Editar/Eliminar) ---
  if (usersTableBody) {
      usersTableBody.addEventListener('click', async (e) => {
          // Lógica para el botón de ELIMINAR (se implementará el backend después)
          if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
              const button = e.target.closest('.btn-delete');
              const userId = button.dataset.id;
              if (confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${userId}?`)) {
                  try {
                      const response = await fetch(`/api/admin/users/${userId}`, {
                          method: 'DELETE',
                      });

                      const data = await response.json();

                      if (response.ok) {
                          alert(data.message || 'Usuario eliminado con éxito.');
                          fetchUsers(); // Recargar la lista
                      } else {
                          alert(data.message || 'Error al eliminar usuario.');
                      }
                  } catch (error) {
                      console.error('Error al conectar con el servidor al eliminar usuario:', error);
                      alert('Error de conexión. No se pudo eliminar el usuario.');
                  }
              }
          }

          // Lógica para el botón de EDITAR (se implementará el backend después)
          if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
              const button = e.target.closest('.btn-edit');
              const userId = button.dataset.id;
              
              const row = button.closest('tr');
              const cells = row.querySelectorAll('td');
              
              editUserId.value = userId;
              editUserName.value = cells[1].textContent;
              editUserEmail.value = cells[2].textContent;
              editUserRole.value = cells[3].textContent; // Asigna el rol actual
              
              editUserMessageDiv.textContent = ''; // Limpiar mensajes
              editUserMessageDiv.className = 'message-area';
              if (editUserModal) {
                  editUserModal.style.display = 'flex'; // Mostrar el modal
              }
          }
      });
  }

  // --- Manejo del formulario de edición dentro del modal ---
  if (editUserForm) {
      editUserForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          editUserMessageDiv.textContent = 'Guardando cambios...';
          editUserMessageDiv.className = 'message-area info';

          const id = editUserId.value;
          const username = editUserName.value;
          const email = editUserEmail.value;
          const role = editUserRole.value;

          try {
              const response = await fetch(`/api/admin/users/${id}`, {
                  method: 'PUT', // Usamos PUT para actualizar
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ username, email, role }),
              });

              const data = await response.json();

              if (response.ok) {
                  editUserMessageDiv.textContent = data.message || 'Usuario actualizado con éxito.';
                  editUserMessageDiv.classList.add('success');
                  setTimeout(() => {
                      if (editUserModal) editUserModal.style.display = 'none';
                      fetchUsers(); // Recargar la lista para ver los cambios
                  }, 1000);
              } else {
                  editUserMessageDiv.textContent = data.message || 'Error al actualizar usuario.';
                  editUserMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al actualizar usuario:', error);
              editUserMessageDiv.textContent = 'Error de conexión. No se pudo actualizar el usuario.';
              editUserMessageDiv.classList.add('error');
          }
      });
  }

  // --- Cerrar modal de edición ---
  if (editUserModal) {
      editUserModal.addEventListener('click', (e) => {
          if (e.target === editUserModal || e.target.classList.contains('close-modal-btn')) {
              editUserModal.style.display = 'none';
          }
      });
  }

  // Llamar a fetchUsers cuando la página se cargue
  fetchUsers();
});