// frontend/js/message/inbox.js
document.addEventListener('DOMContentLoaded', () => {
  const messagesWelcomeHeader = document.getElementById('messagesWelcome');
  const messagesMessageDiv = document.getElementById('messagesMessage');

  const inboxTab = document.getElementById('inboxTab');
  const sentTab = document.getElementById('sentTab');
  const composeTab = document.getElementById('composeTab');

  const inboxContent = document.getElementById('inboxContent');
  const sentContent = document.getElementById('sentContent');
  const composeContent = document.getElementById('composeContent');

  const inboxTableBody = inboxContent.querySelector('tbody');
  const sentTableBody = sentContent.querySelector('tbody');

  const sendMessageForm = document.getElementById('sendMessageForm');
  const recipientSelect = document.getElementById('recipientSelect');
  const studentRelatedSelect = document.getElementById('studentRelatedSelect');
  const messageSubjectInput = document.getElementById('messageSubject');
  const messageContentInput = document.getElementById('messageContent');
  const composeMessageResultDiv = document.getElementById('composeMessageResult');

  // Modal elements
  const messageModal = document.getElementById('messageModal');
  const closeModalButton = messageModal.querySelector('.close-button');
  const modalSubject = document.getElementById('modalSubject');
  const modalSender = document.getElementById('modalSender');
  const modalRecipient = document.getElementById('modalRecipient');
  const modalStudent = document.getElementById('modalStudent');
  const modalDate = document.getElementById('modalDate');
  const modalContent = document.getElementById('modalContent');

  const userName = localStorage.getItem('userName');
  if (userName) {
      messagesWelcomeHeader.textContent = `Bienvenido, ${userName}! Mis Mensajes`;
  } else {
      messagesWelcomeHeader.textContent = 'Mis Mensajes';
  }

  let allUsers = []; // Para almacenar la lista de destinatarios
  let allStudents = []; // Para almacenar la lista de estudiantes para relacionar mensajes

  // Función para mostrar la pestaña activa
  function showTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

      document.getElementById(tabId + 'Content').classList.add('active');
      document.getElementById(tabId + 'Tab').classList.add('active');

      // Cargar datos según la pestaña
      if (tabId === 'inbox') {
          fetchMessages('inbox');
      } else if (tabId === 'sent') {
          fetchMessages('sent');
      } else if (tabId === 'compose') {
          populateRecipientSelect();
          populateStudentRelatedSelect();
      }
  }

  // Fetch messages for inbox/sent
  async function fetchMessages(type) {
      messagesMessageDiv.textContent = `Cargando mensajes ${type === 'inbox' ? 'recibidos' : 'enviados'}...`;
      messagesMessageDiv.className = 'message-area info';
      const targetTableBody = type === 'inbox' ? inboxTableBody : sentTableBody;
      targetTableBody.innerHTML = '';

      try {
        const parentId = localStorage.getItem("userId")
          
          const response = await fetch(`/api/messages/${type}`, {
            headers: {
                'X-User-ID': parentId
            }
          });
          const messages = await response.json();

          if (response.ok) {
              messagesMessageDiv.textContent = '';
              messagesMessageDiv.className = 'message-area';

              if (messages.length === 0) {
                  const row = targetTableBody.insertRow();
                  const cell = row.insertCell();
                  cell.colSpan = type === 'inbox' ? 6 : 5; // Ajustar colspan
                  cell.textContent = `No hay mensajes ${type === 'inbox' ? 'en su bandeja de entrada' : 'enviados'}.`;
                  cell.style.textAlign = 'center';
                  return;
              }

              messages.forEach(msg => {
                  const row = targetTableBody.insertRow();
                  row.insertCell().textContent = type === 'inbox' ? msg.senderName : msg.recipientName;
                  row.insertCell().textContent = msg.subject;
                  row.insertCell().textContent = msg.studentName || 'N/A';
                  row.insertCell().textContent = new Date(msg.date).toLocaleString();
                  if (type === 'inbox') {
                      const statusCell = row.insertCell();
                      statusCell.textContent = msg.read ? 'Leído' : 'No Leído';
                      statusCell.classList.add(msg.read ? 'status-read' : 'status-unread');
                  }

                  const actionsCell = row.insertCell();
                  const viewButton = document.createElement('button');
                  viewButton.textContent = 'Ver';
                  viewButton.classList.add('button', 'button-view');
                  viewButton.addEventListener('click', () => openMessageModal(msg, type));
                  actionsCell.appendChild(viewButton);

                  if (type === 'inbox' && !msg.read) {
                      const markReadButton = document.createElement('button');
                      markReadButton.textContent = 'Marcar Leído';
                      markReadButton.classList.add('button', 'button-mark-read');
                      markReadButton.addEventListener('click', async () => {
                          try {
                              const markResponse = await fetch(`/api/messages/${msg.id}/read`, {
                                  method: 'PUT',
                                  headers: {
                                      'X-User-ID': userId
                                  }
                              });
                              if (markResponse.ok) {
                                  messagesMessageDiv.textContent = 'Mensaje marcado como leído.';
                                  messagesMessageDiv.className = 'message-area success';
                                  fetchMessages('inbox'); // Recargar bandeja de entrada
                              } else {
                                  const errorData = await markResponse.json();
                                  messagesMessageDiv.textContent = errorData.message || 'Error al marcar como leído.';
                                  messagesMessageDiv.className = 'message-area error';
                              }
                          } catch (error) {
                              console.error('Error al marcar como leído:', error);
                              messagesMessageDiv.textContent = 'Error de conexión al marcar como leído.';
                              messagesMessageDiv.className = 'message-area error';
                          }
                      });
                      actionsCell.appendChild(markReadButton);
                  }
              });
          } else {
              messagesMessageDiv.textContent = messages.message || `Error al cargar mensajes ${type === 'inbox' ? 'recibidos' : 'enviados'}.`;
              messagesMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error(`Error de conexión al obtener mensajes ${type}:`, error);
          messagesMessageDiv.textContent = `Error de conexión. No se pudieron cargar los mensajes ${type === 'inbox' ? 'recibidos' : 'enviados'}.`;
          messagesMessageDiv.classList.add('error');
      }
  }

  // Fetch recipients and students for compose form
  async function populateRecipientSelect() {
      recipientSelect.innerHTML = '<option value="">Seleccione un destinatario</option>';
      studentRelatedSelect.innerHTML = '<option value="">(Ninguno)</option>'; // Reset students
      const userId = localStorage.getItem('userId');

      try {
          const response = await fetch('/api/messages/recipients', {
              headers: {
                  'X-User-ID': userId
              }
          });
          const usersData = await response.json();

          if (response.ok) {
              allUsers = usersData; // Guardar para referencia
              usersData.forEach(user => {
                  const option = document.createElement('option');
                  option.value = user.id;
                  option.textContent = `<span class="math-inline">\{user\.username\} \(</span>{user.role})`;
                  recipientSelect.appendChild(option);
              });
          } else {
              composeMessageResultDiv.textContent = usersData.message || 'Error al cargar destinatarios.';
              composeMessageResultDiv.className = 'message-area error';
          }
      } catch (error) {
          console.error('Error al cargar destinatarios:', error);
          composeMessageResultDiv.textContent = 'Error de conexión al cargar destinatarios.';
          composeMessageResultDiv.className = 'message-area error';
      }
  }

  async function populateStudentRelatedSelect() {
      studentRelatedSelect.innerHTML = '<option value="">(Ninguno)</option>'; // Siempre añadir opción "Ninguno"
      const userRole = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userId');

      let studentsToFetch = [];

      if (userRole === 'Parent') {
          // Si es padre, puede seleccionar a sus hijos
          const response = await fetch('/api/parent/my-students', { headers: { 'X-User-ID': userId } });
          const data = await response.json();
          if (response.ok && data.length > 0) {
              studentsToFetch = data.map(s => ({ id: s.id, name: s.name }));
          }
      } else if (userRole === 'Teacher' || userRole === 'Admin') {
          // Profesores/Administradores pueden seleccionar a todos los estudiantes
          const response = await fetch('/api/admin/students', { headers: { 'X-User-ID': userId } }); // Asumiendo que /admin/students lista todos
          const data = await response.json();
          if (response.ok && data.length > 0) {
              studentsToFetch = data.map(s => ({ id: s.id, name: s.name }));
          }
      }

      allStudents = studentsToFetch; // Guardar para referencia
      studentsToFetch.forEach(student => {
          const option = document.createElement('option');
          option.value = student.id;
          option.textContent = student.name;
          studentRelatedSelect.appendChild(option);
      });
  }


  // Send message handler
  sendMessageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      composeMessageResultDiv.textContent = 'Enviando mensaje...';
      composeMessageResultDiv.className = 'message-area info';

      const recipientId = parseInt(recipientSelect.value);
      const studentId = studentRelatedSelect.value ? parseInt(studentRelatedSelect.value) : null;
      const subject = messageSubjectInput.value;
      const content = messageContentInput.value;
      const userId = localStorage.getItem('userId');

      try {
          const response = await fetch('/api/messages/send', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-User-ID': userId
              },
              body: JSON.stringify({ recipientId, studentId, subject, content })
          });
          const result = await response.json();

          if (response.ok) {
              composeMessageResultDiv.textContent = 'Mensaje enviado con éxito.';
              composeMessageResultDiv.className = 'message-area success';
              sendMessageForm.reset(); // Limpiar formulario
              showTab('sent'); // Ir a la bandeja de enviados
          } else {
              composeMessageResultDiv.textContent = result.message || 'Error al enviar mensaje.';
              composeMessageResultDiv.className = 'message-area error';
          }
      } catch (error) {
          console.error('Error de conexión al enviar mensaje:', error);
          composeMessageResultDiv.textContent = 'Error de conexión. No se pudo enviar el mensaje.';
          composeMessageResultDiv.className = 'message-area error';
      }
  });

  // Open message details modal
  function openMessageModal(message, type) {
      modalSubject.textContent = message.subject;
      modalSender.textContent = message.senderName || users.find(u => u.id === message.senderId)?.username || 'Desconocido';
      modalRecipient.textContent = message.recipientName || users.find(u => u.id === message.recipientId)?.username || 'Desconocido';
      modalStudent.textContent = message.studentName || 'N/A';
      modalDate.textContent = new Date(message.date).toLocaleString();
      modalContent.textContent = message.content;
      messageModal.style.display = 'block';

      // Mark as read if in inbox and not already read
      if (type === 'inbox' && !message.read) {
          const userId = localStorage.getItem('userId');
          fetch(`/api/messages/${message.id}/read`, {
              method: 'PUT',
              headers: { 'X-User-ID': userId }
          }).then(response => {
              if (response.ok) {
                  message.read = true; // Update local state
                  fetchMessages('inbox'); // Refresh inbox to update status
              }
          }).catch(error => console.error('Error marking message as read:', error));
      }
  }

  closeModalButton.addEventListener('click', () => {
      messageModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
      if (event.target === messageModal) {
          messageModal.style.display = 'none';
      }
  });


  // Event Listeners for tabs
  inboxTab.addEventListener('click', () => showTab('inbox'));
  sentTab.addEventListener('click', () => showTab('sent'));
  composeTab.addEventListener('click', () => showTab('compose'));

  // Initial load
  showTab('inbox');
});