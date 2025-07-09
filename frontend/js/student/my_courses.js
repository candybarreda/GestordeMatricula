// frontend/js/student/my_courses.js
document.addEventListener('DOMContentLoaded', () => {
  const studentWelcomeHeader = document.getElementById('studentWelcome');
  const myCoursesTableBody = document.getElementById('myCoursesTableBody');
  const myCoursesMessageDiv = document.getElementById('myCoursesMessage');

  // Obtener el nombre de usuario del localStorage para el saludo
  const studentName = localStorage.getItem('username');
  if (studentName) {
      studentWelcomeHeader.textContent = `Bienvenido, ${studentName}!`;
  } else {
      studentWelcomeHeader.textContent = 'Bienvenido!';
  }

  // --- Función para obtener y mostrar los cursos y calificaciones del estudiante ---
  async function fetchMyCoursesAndGrades() {
      myCoursesMessageDiv.textContent = 'Cargando tus cursos...';
      myCoursesMessageDiv.className = 'message-area info';
      myCoursesTableBody.innerHTML = ''; // Limpiar tabla

      try {
          const response = await fetch('/api/student/my-courses');
          const data = await response.json();

          if (response.ok) {
              if (data.length === 0) {
                  myCoursesMessageDiv.textContent = 'Actualmente no estás inscrito en ningún curso.';
                  myCoursesMessageDiv.classList.add('info');
              } else {
                  myCoursesMessageDiv.textContent = '';
                  myCoursesMessageDiv.className = 'message-area';
                  data.forEach(course => {
                      const row = myCoursesTableBody.insertRow();
                      row.insertCell().textContent = course.courseId;
                      row.insertCell().textContent = course.courseName;
                      row.insertCell().textContent = course.courseCode;
                      row.insertCell().textContent = course.credits;
                      row.insertCell().textContent = course.score;
                      row.insertCell().textContent = course.status;
                  });
              }
          } else {
              myCoursesMessageDiv.textContent = data.message || 'Error al cargar tus cursos.';
              myCoursesMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al obtener mis cursos:', error);
          myCoursesMessageDiv.textContent = 'Error de conexión. No se pudieron cargar tus cursos.';
          myCoursesMessageDiv.classList.add('error');
      }
  }

  // Llamar a la función al cargar la página
  fetchMyCoursesAndGrades();
});