// frontend/js/admin/enrollments.js
document.addEventListener('DOMContentLoaded', () => {
  const studentSelect = document.getElementById('studentSelect');
  const courseSelect = document.getElementById('courseSelect');
  const enrollStudentForm = document.getElementById('enrollStudentForm');
  const enrollmentMessageDiv = document.getElementById('enrollmentMessage');
  const enrollmentsTableBody = document.getElementById('enrollmentsTableBody');
  const enrollmentsListMessageDiv = document.getElementById('enrollmentsListMessage');

  // --- Función para cargar estudiantes en el selector ---
  async function loadStudents() {
      try {
          const response = await fetch('/api/admin/students');
          const students = await response.json();
          
          studentSelect.innerHTML = '<option value="">Selecciona un estudiante</option>';
          if (response.ok && students.length > 0) {
              students.forEach(student => {
                  const option = document.createElement('option');
                  option.value = student.id;
                  option.textContent = `${student.name} (${student.email})`;
                  studentSelect.appendChild(option);
              });
          } else {
              studentSelect.innerHTML = '<option value="">No hay estudiantes disponibles</option>';
          }
      } catch (error) {
          console.error('Error al cargar estudiantes para el selector:', error);
          studentSelect.innerHTML = '<option value="">Error al cargar estudiantes</option>';
      }
  }

  // --- Función para cargar cursos en el selector ---
  async function loadCourses() {
      try {
          const response = await fetch('/api/admin/courses');
          const courses = await response.json();

          courseSelect.innerHTML = '<option value="">Selecciona un curso</option>';
          if (response.ok && courses.length > 0) {
              courses.forEach(course => {
                  const option = document.createElement('option');
                  option.value = course.id;
                  option.textContent = `${course.name} (${course.code})`;
                  courseSelect.appendChild(option);
              });
          } else {
              courseSelect.innerHTML = '<option value="">No hay cursos disponibles</option>';
          }
      } catch (error) {
          console.error('Error al cargar cursos para el selector:', error);
          courseSelect.innerHTML = '<option value="">Error al cargar cursos</option>';
      }
  }

  // --- Función para obtener y mostrar inscripciones ---
  async function fetchEnrollments() {
      enrollmentsListMessageDiv.textContent = 'Cargando inscripciones...';
      enrollmentsListMessageDiv.className = 'message-area info';

      try {
          const response = await fetch('/api/admin/enrollments');
          const data = await response.json();

          if (response.ok) {
              enrollmentsTableBody.innerHTML = ''; // Limpiar tabla
              if (data.length === 0) {
                  enrollmentsListMessageDiv.textContent = 'No hay inscripciones registradas aún.';
                  enrollmentsListMessageDiv.classList.add('info');
              } else {
                  enrollmentsListMessageDiv.textContent = '';
                  enrollmentsListMessageDiv.className = 'message-area';
                  data.forEach(enrollment => {
                      const row = enrollmentsTableBody.insertRow();
                      row.dataset.id = enrollment.id;
                      row.insertCell().textContent = enrollment.id;
                      row.insertCell().textContent = enrollment.studentName; // Nombre del estudiante
                      row.insertCell().textContent = enrollment.courseName;   // Nombre del curso

                      const actionsCell = row.insertCell();
                      actionsCell.innerHTML = `
                          <button class="btn btn-sm btn-delete" data-id="${enrollment.id}"><i class="fas fa-trash"></i> Eliminar</button>
                      `;
                  });
              }
          } else {
              enrollmentsListMessageDiv.textContent = data.message || 'Error al cargar inscripciones.';
              enrollmentsListMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener inscripciones:', error);
          enrollmentsListMessageDiv.textContent = 'Error de conexión. No se pudieron cargar las inscripciones.';
          enrollmentsListMessageDiv.classList.add('error');
      }
  }

  // --- Manejar el envío del formulario para inscribir estudiante ---
  if (enrollStudentForm) {
      enrollStudentForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          enrollmentMessageDiv.textContent = '';
          enrollmentMessageDiv.className = 'message-area';

          const studentId = studentSelect.value;
          const courseId = courseSelect.value;

          if (!studentId || !courseId) {
              enrollmentMessageDiv.textContent = 'Por favor, selecciona un estudiante y un curso.';
              enrollmentMessageDiv.classList.add('error');
              return;
          }

          try {
              const response = await fetch('/api/admin/enrollments', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ studentId: parseInt(studentId), courseId: parseInt(courseId) }),
              });

              const data = await response.json();

              if (response.ok) {
                  enrollmentMessageDiv.textContent = data.message || 'Inscripción realizada con éxito.';
                  enrollmentMessageDiv.classList.add('success');
                  enrollStudentForm.reset(); // Limpiar formulario
                  fetchEnrollments(); // Recargar la lista de inscripciones
              } else {
                  enrollmentMessageDiv.textContent = data.message || 'Error al realizar la inscripción.';
                  enrollmentMessageDiv.classList.add('error');
              }
          } catch (error) {
              console.error('Error al conectar con el servidor al inscribir:', error);
              enrollmentMessageDiv.textContent = 'Error de conexión. No se pudo realizar la inscripción.';
              enrollmentMessageDiv.classList.add('error');
          }
      });
  }

  // --- Manejo de la tabla de inscripciones (Eliminar) ---
  if (enrollmentsTableBody) {
      enrollmentsTableBody.addEventListener('click', async (e) => {
          if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
              const button = e.target.closest('.btn-delete');
              const enrollmentId = button.dataset.id;
              if (confirm(`¿Estás seguro de que quieres eliminar la inscripción con ID ${enrollmentId}?`)) {
                  try {
                      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
                          method: 'DELETE',
                      });

                      const data = await response.json();

                      if (response.ok) {
                          alert(data.message || 'Inscripción eliminada con éxito.');
                          fetchEnrollments(); // Recargar la lista
                      } else {
                          alert(data.message || 'Error al eliminar inscripción.');
                      }
                  } catch (error) {
                      console.error('Error al conectar con el servidor al eliminar inscripción:', error);
                      alert('Error de conexión. No se pudo eliminar la inscripción.');
                  }
              }
          }
      });
  }

  // Cargar datos iniciales
  loadStudents();
  loadCourses();
  fetchEnrollments();
});