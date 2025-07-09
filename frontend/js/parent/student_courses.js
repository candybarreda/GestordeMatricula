// frontend/js/parent/student_courses.js
document.addEventListener('DOMContentLoaded', () => {
   
    const parentWelcomeHeader = document.getElementById('parentWelcome');
    const studentsCardsContainer = document.getElementById('studentsCardsContainer');
    const parentStudentsMessageDiv = document.getElementById('parentStudentsMessage'); // ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÁ AQUÍ!
    const studentCardTemplate = document.getElementById('studentCardTemplate');


    let currentSelectedStudentId = null; // Para saber qué estudiante está activo
    const parentName = localStorage.getItem('userName');
    if (parentName) {
        parentWelcomeHeader.textContent = `Bienvenido, ${parentName}!`;
    } else {
        parentWelcomeHeader.textContent = 'Bienvenido, Padre/Madre!';
    }

  // --- Función para cargar los estudiantes asociados al padre/tutor ---
  async function fetchParentStudents() {
    parentStudentsMessageDiv.textContent = 'Cargando cursos de sus estudiantes...';
    parentStudentsMessageDiv.className = 'message-area info';
    studentsCardsContainer.innerHTML = ''; // Limpiar el contenido existente, excepto el template

    try {
        const parentId = localStorage.getItem('userId');
        if (!parentId) {
                showMessage('Error: No se encontró el ID de usuario. Por favor, vuelve a iniciar sesión.', 'error');
                return;
        }
        const response = await fetch('/api/parent/my-students',{
            headers: {
                    'X-User-ID': parentId
            }
        });
        const data = await response.json();

        console.log("[fetchParentStudents]: ", data)

        if (response.ok) {
            if (data.length === 0) {
                parentStudentsMessageDiv.textContent = 'No hay estudiantes asociados a su cuenta o no tienen cursos inscritos.';
                parentStudentsMessageDiv.classList.add('info');
            } else {
                parentStudentsMessageDiv.textContent = '';
                parentStudentsMessageDiv.className = 'message-area';

                data.forEach(student => {
                    const studentCard = studentCardTemplate.cloneNode(true);
                    studentCard.style.display = 'block';
                    studentCard.removeAttribute('id'); // Remover el ID del template

                    studentCard.querySelector('h3').textContent = student.name;
                    studentCard.querySelector('p span:nth-child(1)').textContent = student.id;
                    studentCard.querySelector('p span:nth-child(2)').textContent = student.email;
                    studentCard.querySelector('p span:nth-child(3)').textContent = student.grade;

                    const coursesTableBody = studentCard.querySelector('.course-grades-table tbody'); // Usar la nueva clase
                    coursesTableBody.innerHTML = ''; // Limpiar cualquier contenido de ejemplo

                    if (student.courses && student.courses.length > 0) {
                        student.courses.forEach(course => {
                            const row = coursesTableBody.insertRow();
                            
                            row.insertCell().textContent = course.nombre;
                            row.insertCell().textContent = course.code;
                            row.insertCell().textContent = course.credits;
                            row.insertCell().textContent = course.score;
                            row.insertCell().textContent = course.status;
                        });
                    } else {
                        const row = coursesTableBody.insertRow();
                        const cell = row.insertCell();
                        cell.colSpan = 6;
                        cell.textContent = 'No hay cursos inscritos para este estudiante.';
                        cell.style.textAlign = 'center';
                    }
                    studentsCardsContainer.appendChild(studentCard);
                });
            }
        } else {
            parentStudentsMessageDiv.textContent = data.message || 'Error al cargar los estudiantes del padre.';
            parentStudentsMessageDiv.classList.add('error');
        }
    } catch (error) {
        console.error('Error de conexión al obtener estudiantes del padre:', error);
        parentStudentsMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los estudiantes de sus hijos.';
        parentStudentsMessageDiv.classList.add('error');
    }
}

  // --- Función para cargar los cursos de un estudiante específico ---
  async function fetchCoursesForStudent(studentId, studentName) {
      selectedStudentNameHeader.textContent = `Cursos de ${studentName}:`;
      studentCoursesTableBody.innerHTML = ''; // Limpiar tabla
      studentCoursesMessageDiv.textContent = 'Cargando cursos del estudiante...';
      studentCoursesMessageDiv.className = 'message-area info';

      try {
          const response = await fetch(`/api/parent/student/${studentId}/courses`);
          const data = await response.json();

          if (response.ok) {
              if (data.length === 0) {
                  studentCoursesMessageDiv.textContent = 'Este estudiante no está inscrito en ningún curso.';
                  studentCoursesMessageDiv.classList.add('info');
              } else {
                  studentCoursesMessageDiv.textContent = '';
                  studentCoursesMessageDiv.className = 'message-area';
                  data.forEach(course => {
                      const row = studentCoursesTableBody.insertRow();
                      row.insertCell().textContent = course.id;
                      row.insertCell().textContent = course.name;
                      row.insertCell().textContent = course.code;
                      row.insertCell().textContent = course.credits;
                  });
              }
          } else {
              studentCoursesMessageDiv.textContent = data.message || 'Error al cargar los cursos del estudiante.';
              studentCoursesMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error(`Error de conexión al obtener cursos para el estudiante ${studentId}:`, error);
          studentCoursesMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los cursos del estudiante.';
          studentCoursesMessageDiv.classList.add('error');
      }
  }

 
  // Inicializar: Cargar la lista de estudiantes al cargar la página
  fetchParentStudents();
});