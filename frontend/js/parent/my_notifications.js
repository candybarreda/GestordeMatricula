// frontend/js/parent/my_notifications.js
document.addEventListener('DOMContentLoaded', () => {
  const parentWelcomeHeader = document.getElementById('parentWelcome');
  const notificationsListDiv = document.getElementById('notificationsList');
  const notificationsMessageDiv = document.getElementById('notificationsMessage');

  const parentName = localStorage.getItem('userName');
  if (parentName) {
      parentWelcomeHeader.textContent = `Hola, ${parentName}! Tus Notificaciones:`;
  } else {
      parentWelcomeHeader.textContent = 'Tus Notificaciones:';
  }

  async function fetchParentNotifications() {
      notificationsMessageDiv.textContent = 'Cargando tus notificaciones...';
      notificationsMessageDiv.className = 'message-area info';
      notificationsListDiv.innerHTML = '';

      try {
          const parentId = localStorage.getItem("userId")
          const response = await fetch('/api/parent/my-notifications', {
            headers: {
                'X-User-Id': parentId
            }
          });
          const data = await response.json();

          if (response.ok) {
              if (data.length === 0) {
                  notificationsMessageDiv.textContent = 'No tienes notificaciones nuevas.';
                  notificationsMessageDiv.classList.add('info');
              } else {
                  notificationsMessageDiv.textContent = '';
                  notificationsMessageDiv.className = 'message-area';
                  // Ordenar por fecha, las más recientes primero
                  data.sort((a, b) => new Date(b.date) - new Date(a.date));

                  console.log(data)

                  data.forEach(notification => {
                      const notificationCard = document.createElement('div');
                      notificationCard.classList.add('notification-card');
                      if (!notification.Leido) {
                          notificationCard.classList.add('unread');
                      }

                      const formattedDate = new Date(notification.Fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

                      notificationCard.innerHTML = `
                          <div class="notification-header">
                              
                              <span class="notification-date">${formattedDate}</span>
                          </div>
                          <p>${notification.Mensaje}</p>
                          <div class="notification-actions">
                              ${!notification.Leido ? `<button class="btn btn-secondary btn-sm mark-read-btn" data-notification-id="${notification.NotificacionID}">Marcar como leído</button>` : ''}
                          </div>
                      `;
                      notificationsListDiv.appendChild(notificationCard);
                  });
              }
          } else {
              notificationsMessageDiv.textContent = data.message || 'Error al cargar tus notificaciones.';
              notificationsMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener notificaciones del padre:', error);
          notificationsMessageDiv.textContent = 'Error de conexión. No se pudieron cargar tus notificaciones.';
          notificationsMessageDiv.classList.add('error');
      }
  }

  // --- Manejar el marcado de notificaciones como leídas ---
  if (notificationsListDiv) {
      notificationsListDiv.addEventListener('click', async (e) => {
          if (e.target.classList.contains('mark-read-btn')) {
            console.log(e.target.dataset.notificationId)
              const notificationId = parseInt(e.target.dataset.notificationId);
              if (isNaN(notificationId)) {
                  console.error('ID de notificación inválido.');
                  return;
              }

              try {
                
                  const parentId = localStorage.getItem("userId")
                  const response = await fetch(`/api/parent/notifications/${notificationId}/read`, {
                      method: 'PUT',
                      headers: {
                        'X-User-ID': parentId
                      }
                  });

                  const data = await response.json();

                  if (response.ok) {
                      notificationsMessageDiv.textContent = data.message || 'Notificación marcada como leída.';
                      notificationsMessageDiv.className = 'message-area success';
                      // Recargar las notificaciones para actualizar la vista
                      fetchParentNotifications();
                  } else {
                      notificationsMessageDiv.textContent = data.message || 'Error al marcar como leída.';
                      notificationsMessageDiv.classList.add('error');
                  }
              } catch (error) {
                  console.error('Error de conexión al marcar notificación como leída:', error);
                  notificationsMessageDiv.textContent = 'Error de conexión al marcar notificación como leída.';
                  notificationsMessageDiv.classList.add('error');
              }
          }
      });
  }

  fetchParentNotifications();
});