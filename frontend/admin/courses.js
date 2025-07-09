// frontend/js/admin/courses.js
document.addEventListener('DOMContentLoaded', () => {

    
  const coursesTableBody = document.getElementById('coursesTableBody');
  const addCourseForm = document.getElementById('addCourseForm');
  const addCourseMessageDiv = document.getElementById('addCourseMessage');
  const coursesListMessageDiv = document.getElementById('coursesListMessage');

  // --- Variables para el formulario de edición (Modal) ---
  const editCourseModal = document.getElementById('editCourseModal');
  const editCourseForm = document.getElementById('editCourseForm');
  const editCourseId = document.getElementById('editCourseId');
  const editCourseName = document.getElementById('editCourseName');
  const editCourseCode = document.getElementById('editCourseCode');
  const editCourseCredits = document.getElementById('editCourseCredits');
  const editCourseMessageDiv = document.getElementById('editCourseMessage');

  // Función para obtener y mostrar cursos
  async function fetchCourses() {
      coursesListMessageDiv.textContent = 'Cargando cursos...';
      coursesListMessageDiv.className = 'message-area info';

      try {
          const response = await fetch('/api/admin/courses');
          const data = await response.json();

          if (response.ok) {
              coursesTableBody.innerHTML = ''; // Limpiar tabla
              if (data.length === 0) {
                  coursesListMessageDiv.textContent = 'No hay cursos registrados aún.';
                  coursesListMessageDiv.classList.add('info');
              } else {
                  coursesListMessageDiv.textContent = '';
                  coursesListMessageDiv.className = 'message-area';
                  data.forEach(course => {
                      const row = coursesTableBody.insertRow();
                      row.dataset.id = course.id;
                      row.insertCell().textContent = course.id;
                      row.insertCell().textContent = course.name;
                      row.insertCell().textContent = course.code;
                      row.insertCell().textContent = course.credits;

                      const actionsCell = row.insertCell();
                      actionsCell.innerHTML = `
                          <button class="btn btn-sm btn-edit" data-id="${course.id}"><i class="fas fa-edit"></i> Editar</button>
                          <button class="btn btn-sm btn-delete" data-id="${course.id}"><i class="fas fa-trash"></i> Eliminar</button>
                      `;
                  });
              }
          } else {
              coursesListMessageDiv.textContent = data.message || 'Error al cargar cursos.';
              coursesListMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener cursos:', error);
          coursesListMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los cursos.';
          coursesListMessageDiv.classList.add('error');
      }
  }

  // Manejar el envío del formulario para añadir curso
  if (addCourseForm) {
      addCourseForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          addCourseMessageDiv.textContent = '';
          addCourseMessageDiv.className = 'message-area';

          const name = document.getElementById('courseName').value;
          const code = document.getElementById('courseCode').value;
          const credits = parseInt(document.getElementById('courseCredits').value); // Convertir a número

          if (isNaN(credits) || credits < 1) {
              addCourseMessageDiv.textContent = 'Los créditos deben ser un número válido mayor o igual a 1.';
              addCourseMessageDiv.classList.add('error');
              return;
          }

          try {
              const response = await fetch('/api/admin/courses', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ name, code, credits }),
              });

              const data = await response.json();

              if (response.ok) {
                  addCourseMessageDiv.textContent = data.message || 'Curso añadido con éxito.';
                  addCourseMessageDiv.classList.add('success');
                  addCourseForm.reset();
                  fetchCourses(); // Recargar la lista
              } else {
                  addCourseMessageDiv.textContent = data.message || 'Error al añadir curso.';
                  addCourseMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al añadir curso:', error);
              addCourseMessageDiv.textContent = 'Error de conexión. No se pudo añadir el curso.';
              addCourseMessageDiv.classList.add('error');
          }
      });
  }

  // --- Manejo de la tabla de cursos (Editar/Eliminar) ---
  if (coursesTableBody) {
      coursesTableBody.addEventListener('click', async (e) => {
          // Lógica para el botón de ELIMINAR
          if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
              const button = e.target.closest('.btn-delete');
              const courseId = button.dataset.id;
              if (confirm(`¿Estás seguro de que quieres eliminar el curso con ID ${courseId}?`)) {
                  try {
                      const response = await fetch(`/api/admin/courses/${courseId}`, {
                          method: 'DELETE',
                      });

                      const data = await response.json();

                      if (response.ok) {
                          alert(data.message || 'Curso eliminado con éxito.');
                          fetchCourses(); // Recargar la lista
                      } else {
                          alert(data.message || 'Error al eliminar curso.');
                      }
                  } catch (error) {
                      console.error('Error al conectar con el servidor al eliminar:', error);
                      alert('Error de conexión. No se pudo eliminar el curso.');
                  }
              }
          }

          // Lógica para el botón de EDITAR
          if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
              const button = e.target.closest('.btn-edit');
              const courseId = button.dataset.id;

              const row = button.closest('tr');
              const cells = row.querySelectorAll('td');

              editCourseId.value = courseId;
              editCourseName.value = cells[1].textContent;
              editCourseCode.value = cells[2].textContent;
              editCourseCredits.value = cells[3].textContent;

              editCourseMessageDiv.textContent = '';
              editCourseMessageDiv.className = 'message-area';
              if (editCourseModal) {
                  editCourseModal.style.display = 'flex'; // Mostrar el modal
              }
          }
      });
  }

  // --- Manejo del formulario de edición dentro del modal ---
  if (editCourseForm) {
      editCourseForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          editCourseMessageDiv.textContent = 'Guardando cambios...';
          editCourseMessageDiv.className = 'message-area info';

          const id = editCourseId.value;
          const name = editCourseName.value;
          const code = editCourseCode.value;
          const credits = parseInt(editCourseCredits.value);

          if (isNaN(credits) || credits < 1) {
              editCourseMessageDiv.textContent = 'Los créditos deben ser un número válido mayor o igual a 1.';
              editCourseMessageDiv.classList.add('error');
              return;
          }

          try {
              const response = await fetch(`/api/admin/courses/${id}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ name, code, credits }),
              });

              const data = await response.json();

              if (response.ok) {
                  editCourseMessageDiv.textContent = data.message || 'Curso actualizado con éxito.';
                  editCourseMessageDiv.classList.add('success');
                  setTimeout(() => {
                      if (editCourseModal) editCourseModal.style.display = 'none';
                      fetchCourses(); // Recargar la lista
                  }, 1000);
              } else {
                  editCourseMessageDiv.textContent = data.message || 'Error al actualizar curso.';
                  editCourseMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al actualizar:', error);
              editCourseMessageDiv.textContent = 'Error de conexión. No se pudo actualizar el curso.';
              editCourseMessageDiv.classList.add('error');
          }
      });
  }

  // --- Cerrar modal de edición ---
  if (editCourseModal) {
      editCourseModal.addEventListener('click', (e) => {
          if (e.target === editCourseModal || e.target.classList.contains('close-modal-btn')) {
              editCourseModal.style.display = 'none';
          }
      });
  }

  // Llamar a fetchCourses cuando la página se cargue
  fetchCourses();
});