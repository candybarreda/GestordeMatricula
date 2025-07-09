// frontend/js/admin/assign_courses.js
document.addEventListener('DOMContentLoaded', () => {
  const assignmentMessageDiv = document.getElementById('assignmentMessage');
  const assignCourseForm = document.getElementById('assignCourseForm');
  const courseSelect = document.getElementById('courseSelect');
  const teacherSelect = document.getElementById('teacherSelect');
  const assignmentsTableBody = document.getElementById('assignmentsTableBody');

  // Función para mostrar mensajes
  function showMessage(message, type) {
      assignmentMessageDiv.textContent = message;
      assignmentMessageDiv.className = `message-area ${type}`;
  }

  // Función para cargar cursos disponibles (no asignados)
  async function loadAvailableCourses() {
      courseSelect.innerHTML = '<option value="">Cargando cursos...</option>';
      try {
          const response = await fetch('/api/admin/available-courses');
          const data = await response.json();

          if (response.ok) {
              courseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
              if (data.length === 0) {
                  courseSelect.innerHTML = '<option value="">No hay cursos disponibles para asignar</option>';
                  courseSelect.disabled = true;
              } else {
                  courseSelect.disabled = false;
                  data.forEach(course => {
                      const option = document.createElement('option');
                      option.value = course.id;
                      option.innerHTML = `<span class="math-inline">${course.name} </span>${course.code}`;
                      courseSelect.appendChild(option);
                  });
              }
          } else {
              showMessage(data.message || 'Error al cargar cursos disponibles.', 'error');
          }
      } catch (error) {
          console.error('Error de conexión al cargar cursos:', error);
          showMessage('Error de conexión al cargar cursos disponibles.', 'error');
      }
  }

  // Función para cargar la lista de profesores
  async function loadTeachers() {
      teacherSelect.innerHTML = '<option value="">Cargando profesores...</option>';
      try {
          const response = await fetch('/api/admin/teachers');
          const data = await response.json();

          if (response.ok) {
              teacherSelect.innerHTML = '<option value="">Seleccione un profesor</option>';
              if (data.length === 0) {
                  teacherSelect.innerHTML = '<option value="">No hay profesores disponibles</option>';
                  teacherSelect.disabled = true;
              } else {
                  teacherSelect.disabled = false;
                  data.forEach(teacher => {
                      const option = document.createElement('option');
                      option.value = teacher.id;
                      option.textContent = teacher.username;
                      teacherSelect.appendChild(option);
                  });
              }
          } else {
              showMessage(data.message || 'Error al cargar profesores.', 'error');
          }
      } catch (error) {
          console.error('Error de conexión al cargar profesores:', error);
          showMessage('Error de conexión al cargar profesores.', 'error');
      }
  }

  // Función para cargar y mostrar asignaciones actuales
  async function loadCourseAssignments() {
      assignmentsTableBody.innerHTML = ''; // Limpiar tabla
      showMessage('Cargando asignaciones...', 'info');
      try {
          const response = await fetch('/api/admin/course-assignments');
          const data = await response.json();

          if (response.ok) {
              showMessage('', ''); // Limpiar mensaje
              if (data.length === 0) {
                  const row = assignmentsTableBody.insertRow();
                  const cell = row.insertCell();
                  cell.colSpan = 5;
                  cell.textContent = 'No hay asignaciones de cursos registradas.';
                  cell.style.textAlign = 'center';
                  return;
              }

              data.forEach(assignment => {
                  const row = assignmentsTableBody.insertRow();
                  row.insertCell().textContent = assignment.courseId;
                  row.insertCell().textContent = assignment.courseName;
                  row.insertCell().textContent = assignment.teacherId;
                  row.insertCell().textContent = assignment.teacherName;

                  const actionsCell = row.insertCell();
                  const deleteButton = document.createElement('button');
                  deleteButton.textContent = 'Desasignar';
                  deleteButton.classList.add('button', 'button-delete');
                  deleteButton.addEventListener('click', async () => {
                      if (confirm(`¿Estás seguro de desasignar a ${assignment.teacherName} del curso ${assignment.courseName}?`)) {
                          await deleteAssignment(assignment.courseId);
                      }
                  });
                  actionsCell.appendChild(deleteButton);
              });
          } else {
              showMessage(data.message || 'Error al cargar asignaciones.', 'error');
          }
      } catch (error) {
          console.error('Error de conexión al cargar asignaciones:', error);
          showMessage('Error de conexión al cargar asignaciones.', 'error');
      }
  }

  // Manejador del formulario de asignación
  assignCourseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const courseId = parseInt(courseSelect.value);
      const teacherId = parseInt(teacherSelect.value);

      if (!courseId || !teacherId) {
          showMessage('Por favor, seleccione un curso y un profesor.', 'error');
          return;
      }

      showMessage('Asignando curso...', 'info');
      try {
          const response = await fetch('/api/admin/course-assignments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseId, teacherId })
          });
          const result = await response.json();

          if (response.ok) {
              showMessage(result.message, 'success');
              assignCourseForm.reset(); // Limpiar formulario
              // Recargar datos para actualizar las tablas
              loadAvailableCourses();
              loadCourseAssignments();
          } else {
              showMessage(result.message || 'Error al asignar curso.', 'error');
          }
      } catch (error) {
          console.error('Error de conexión al asignar curso:', error);
          showMessage('Error de conexión al asignar curso.', 'error');
      }
  });

  // Función para eliminar asignación
  async function deleteAssignment(courseId) {
      showMessage('Desasignando curso...', 'info');
      try {
          const response = await fetch(`/api/admin/course-assignments/${courseId}`, {
              method: 'DELETE'
          });
          const result = await response.json();

          if (response.ok) {
              showMessage(result.message, 'success');
              // Recargar datos para actualizar las tablas
              loadAvailableCourses();
              loadCourseAssignments();
          } else {
              showMessage(result.message || 'Error al desasignar curso.', 'error');
          }
      } catch (error) {
          console.error('Error de conexión al desasignar curso:', error);
          showMessage('Error de conexión al desasignar curso.', 'error');
      }
  }

  // Cargar datos iniciales al cargar la página
  loadAvailableCourses();
  loadTeachers();
  loadCourseAssignments();
});