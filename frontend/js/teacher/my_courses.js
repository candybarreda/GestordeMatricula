// frontend/js/teacher/my_courses.js
// frontend/js/teacher/my_courses.js
document.addEventListener('DOMContentLoaded', () => {
    const teacherWelcomeHeader = document.getElementById('teacherWelcome');
    const teacherCoursesContainer = document.getElementById('teacherCoursesContainer');
    const teacherCoursesMessageDiv = document.getElementById('teacherCoursesMessage');
    const courseCardTemplate = document.getElementById('courseCardTemplate');

    // Obtener el nombre de usuario y el ID del localStorage para el saludo y la autenticación
    const teacherName = localStorage.getItem('username');
    const teacherId = localStorage.getItem('userId');

    if (teacherName) {
        teacherWelcomeHeader.textContent = `Bienvenido, Profesor(a) ${teacherName}! Mis Cursos Asignados:`;
    } else {
        teacherWelcomeHeader.textContent = 'Mis Cursos Asignados:';
    }

    // Función para mostrar mensajes en la UI
    function showMessage(message, type = '') {
        teacherCoursesMessageDiv.textContent = message;
        teacherCoursesMessageDiv.className = `message-area ${type}`;
    }

    // --- Función para cargar los cursos asignados al profesor ---
    async function fetchTeacherCourses() {
        showMessage('Cargando sus cursos asignados...', 'info');
        teacherCoursesContainer.innerHTML = ''; // Limpiar el contenido existente

        try {
            const response = await fetch('/api/teacher/my-assigned-courses', {
                headers: {
                    'X-User-ID': teacherId // Pasar el ID del usuario para la autenticación simulada
                }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.length === 0) {
                    showMessage('No tiene cursos asignados en este momento.', 'info');
                } else {
                    showMessage('', ''); // Limpiar mensaje si hay datos

                    data.forEach(course => {
                        const courseCard = courseCardTemplate.cloneNode(true);
                        courseCard.style.display = 'block';
                        courseCard.removeAttribute('id'); // Remover el ID del template

                        // Actualizar el contenido de la tarjeta del curso
                        courseCard.querySelector('h3').innerHTML = `<span class="math-inline">${course.name} (</span>${course.code})`;
                        //courseCard.querySelector('h3').textContent = `<span class="math-inline">\{course\.name\} \(</span>{course.code})`;
                        courseCard.querySelector('p span').textContent = course.credits;

                        const studentsTableBody = courseCard.querySelector('.student-grades-table tbody');
                        studentsTableBody.innerHTML = ''; // Limpiar cualquier contenido de ejemplo

                        if (course.students && course.students.length > 0) {
                            course.students.forEach(student => {
                                const row = studentsTableBody.insertRow();
                                row.insertCell().textContent = student.id;
                                row.insertCell().textContent = student.name;
                                row.insertCell().textContent = student.email;
                                row.insertCell().textContent = student.grade; // Grado del estudiante
                                row.insertCell().textContent = student.score; // Calificación del curso (si existe)
                                row.insertCell().textContent = student.status; // Estado del estudiante en el curso (si existe)
                            });
                        } else {
                            const row = studentsTableBody.insertRow();
                            const cell = row.insertCell();
                            cell.colSpan = 6; // Ajusta el colspan si añades más columnas
                            cell.textContent = 'No hay estudiantes inscritos en este curso.';
                            cell.style.textAlign = 'center';
                        }
                        teacherCoursesContainer.appendChild(courseCard);
                    });
                }
            } else {
                showMessage(data.message || 'Error al cargar sus cursos asignados.', 'error');
            }
        } catch (error) {
            console.error('Error de conexión al obtener cursos del profesor:', error);
            showMessage('Error de conexión. No se pudieron cargar sus cursos asignados.', 'error');
        }
    }

    // Cargar los cursos del profesor al cargar la página
    fetchTeacherCourses();
});




/*document.addEventListener('DOMContentLoaded', () => {
    const teacherWelcomeHeader = document.getElementById('teacherWelcome');
    const teacherCoursesContainer = document.getElementById('teacherCoursesContainer');
    const teacherCoursesMessageDiv = document.getElementById('teacherCoursesMessage');
    const courseCardTemplate = document.getElementById('courseCardTemplate');

   


   // Nuevos elementos para asistencia
   const attendanceManagementContainer = document.querySelector('.attendance-management-container');
   const attendanceCourseNameHeader = document.getElementById('attendanceCourseName');
   const attendanceDateInput = document.getElementById('attendanceDate');
   const loadAttendanceButton = document.getElementById('loadAttendanceButton');
   const attendanceMessageDiv = document.getElementById('attendanceMessage');
   const attendanceForm = document.getElementById('attendanceForm');
   const attendanceTableBody = document.getElementById('attendanceTableBody');
   const saveAttendanceButton = document.getElementById('saveAttendanceButton');

    // NUEVOS elementos para notificaciones
    const sendNotificationContainer = document.querySelector('.send-notification-container');
    const selectedStudentForNotificationDiv = document.getElementById('selectedStudentForNotification');
    const notificationMessageArea = document.getElementById('notificationMessageArea');
    const notificationForm = document.getElementById('notificationForm');
    const notificationTitleInput = document.getElementById('notificationTitle');
    const notificationMessageInput = document.getElementById('notificationMessage');
    const sendNotificationButton = document.getElementById('sendNotificationButton');




  let currentSelectedCourseId = null; // Para saber qué curso está activo
  let currentSelectedCourseName = ''; // Para usar en las secciones de calificación y asistencia
  let currentSelectedStudentId = null; // Para la notificación


  // Obtener el nombre de usuario del localStorage para el saludo
  const teacherName = localStorage.getItem('username');
  const teacherId = localStorage.getItem('userId'); // Necesitamos el ID para la autenticación simulada

  
  if (teacherName) {
    teacherWelcomeHeader.textContent = `Bienvenido, Profesor(a) ${teacherName}! Mis Cursos Asignados:`;
} else {
    teacherWelcomeHeader.textContent = 'Mis Cursos Asignados:';
}

   // Establecer la fecha actual por defecto en el input de asistencia
   const today = new Date();
   const yyyy = today.getFullYear();
   const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
   const dd = String(today.getDate()).padStart(2, '0');
   attendanceDateInput.value = `${yyyy}-${mm}-${dd}`;

  // --- Función para cargar los cursos asignados al profesor ---
  async function fetchTeacherCourses() {
      teacherCoursesMessageDiv.textContent = 'Cargando tus cursos...';
      teacherCoursesMessageDiv.className = 'message-area info';
      teacherCoursesList.innerHTML = ''; // Limpiar lista

      try{
        const response = await fetch('/api/teacher/my-assigned-courses', {
            headers: {
                'X-User-ID': teacherId // Pasar el ID del usuario para la autenticación simulada
            }
        });
        const data = await response.json();

          if (response.ok) {
              if (data.length === 0) {
                  teacherCoursesMessageDiv.textContent = 'No tienes cursos asignados actualmente.';
                  teacherCoursesMessageDiv.classList.add('info');
              } else {
                  teacherCoursesMessageDiv.textContent = '';
                  teacherCoursesMessageDiv.className = 'message-area';
                  data.forEach(course => {
                    const courseCard = courseCardTemplate.cloneNode(true);
                    courseCard.style.display = 'block';
                    courseCard.removeAttribute('id'); // Remover el ID del template

                    courseCard.querySelector('h3').textContent = `<span class="math-inline">\{course\.name\} \(</span>{course.code})`;
                    courseCard.querySelector('p span').textContent = course.credits;

                    const studentsTableBody = courseCard.querySelector('.student-grades-table tbody');
                    studentsTableBody.innerHTML = ''; // Limpiar cualquier contenido de ejemplo

                    if (course.students && course.students.length > 0) {
                        course.students.forEach(student => {
                            const row = studentsTableBody.insertRow();
                            row.insertCell().textContent = student.id;
                            row.insertCell().textContent = student.name;
                            row.insertCell().textContent = student.email;
                            row.insertCell().textContent = student.grade;
                            row.insertCell().textContent = student.score;
                            row.insertCell().textContent = student.status;
                        });
                    } else {
                        const row = studentsTableBody.insertRow();
                        const cell = row.insertCell();
                        cell.colSpan = 6;
                        cell.textContent = 'No hay estudiantes inscritos en este curso.';
                        cell.style.textAlign = 'center';
                    }
                    teacherCoursesContainer.appendChild(courseCard);
                });
            }
          } else {
              teacherCoursesMessageDiv.textContent = data.message || 'Error al cargar tus cursos.';
              teacherCoursesMessageDiv.classList.add('error');
          }
        } catch (error) {
            console.error('Error de conexión al obtener cursos del profesor:', error);
            teacherCoursesMessageDiv.textContent = 'Error de conexión. No se pudieron cargar tus cursos.';
            teacherCoursesMessageDiv.classList.add('error');
        }
  }

  // --- Función para cargar los estudiantes de un curso específico ---
  async function fetchStudentsInCourse(courseId, courseName) {
    selectedCourseNameHeader.textContent = `Estudiantes en ${courseName}:`;
    studentsInCourseTableBody.innerHTML = ''; // Limpiar tabla
    studentsInCourseMessageDiv.textContent = 'Cargando estudiantes del curso...';
    studentsInCourseMessageDiv.className = 'message-area info';
    saveGradesButton.style.display = 'none'; // Ocultar el botón hasta que se carguen los estudiantes
    // Ocultar sección de notificación hasta que se seleccione un estudiante
    sendNotificationContainer.style.display = 'none';
    selectedStudentForNotificationDiv.textContent = '';
    currentSelectedStudentId = null;
    sendNotificationButton.disabled = true;
    
    try {
        const response = await fetch(`/api/teacher/course/${courseId}/students`);
        const data = await response.json();

        if (response.ok) {
            if (data.length === 0) {
                studentsInCourseMessageDiv.textContent = 'No hay estudiantes inscritos en este curso.';
                studentsInCourseMessageDiv.classList.add('info');
            } else {
                studentsInCourseMessageDiv.textContent = '';
                studentsInCourseMessageDiv.className = 'message-area';
                data.forEach(student => {
                    const row = studentsInCourseTableBody.insertRow();
                    row.insertCell().textContent = student.id;
                   
                    const nameCell = row.insertCell(); // Celda para el nombre del estudiante
                        nameCell.textContent = student.name;
                        nameCell.classList.add('selectable-student'); // Añadir clase para hacer clic
                        nameCell.dataset.studentId = student.id; // Añadir ID para referencia
                        nameCell.dataset.studentName = student.name; // Añadir nombre para referencia
                        row.insertCell().textContent = student.grade;

                    // Celda para la Calificación
                    const scoreCell = row.insertCell();
                    const scoreInput = document.createElement('input');
                    scoreInput.type = 'text'; // Puede ser 'number' si solo se permiten números
                    scoreInput.name = `score_${student.id}`;
                    scoreInput.value = student.currentScore || ''; // Valor actual o vacío
                    scoreInput.placeholder = 'Ej: 20';
                    scoreInput.classList.add('grade-input');
                    scoreCell.appendChild(scoreInput);

                    // Celda para el Estado
                    const statusCell = row.insertCell();
                    const statusSelect = document.createElement('select');
                    statusSelect.name = `status_${student.id}`;
                    statusSelect.classList.add('grade-status-select');
                    
                    const statuses = ['Inscrito', 'En Curso', 'Completado', 'Retirado'];
                    statuses.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status;
                        option.textContent = status;
                        if (student.currentStatus === status) {
                            option.selected = true;
                        }
                        statusSelect.appendChild(option);
                    });
                    statusCell.appendChild(statusSelect);

                    // Asignar dataset para identificar al estudiante/curso al guardar
                    row.dataset.studentId = student.id;
                    row.dataset.courseId = courseId; // El courseId ya lo tenemos
                });
                saveGradesButton.style.display = 'block'; // Mostrar el botón cuando hay estudiantes
            }
        } else {
            studentsInCourseMessageDiv.textContent = data.message || 'Error al cargar los estudiantes del curso.';
            studentsInCourseMessageDiv.classList.add('error');
        }
    } catch (error) {
        console.error(`Error de conexión al obtener estudiantes para el curso ${courseId}:`, error);
        studentsInCourseMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los estudiantes del curso.';
        studentsInCourseMessageDiv.classList.add('error');
    }
}

 // --- NUEVO: Función para cargar la asistencia de un curso para una fecha específica ---
 async function fetchAttendance(courseId, date) {
  attendanceTableBody.innerHTML = ''; // Limpiar tabla
  attendanceMessageDiv.textContent = 'Cargando asistencia...';
  attendanceMessageDiv.className = 'message-area info';
  saveAttendanceButton.style.display = 'none';

  try {
      const response = await fetch(`/api/teacher/course/${courseId}/attendance/${date}`);
      const data = await response.json();

      if (response.ok) {
          if (data.length === 0) {
              attendanceMessageDiv.textContent = 'No hay estudiantes inscritos en este curso para registrar asistencia.';
              attendanceMessageDiv.classList.add('info');
          } else {
              attendanceMessageDiv.textContent = '';
              attendanceMessageDiv.className = 'message-area';
              data.forEach(student => {
                  const row = attendanceTableBody.insertRow();
                  row.insertCell().textContent = student.id;
                  row.insertCell().textContent = student.name;

                  const statusCell = row.insertCell();
                  const statusSelect = document.createElement('select');
                  statusSelect.name = `attendance_status_${student.id}`;
                  statusSelect.classList.add('attendance-status-select');
                  
                  const attendanceStatuses = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];
                  attendanceStatuses.forEach(status => {
                      const option = document.createElement('option');
                      option.value = status;
                      option.textContent = status;
                      if (student.attendanceStatus === status) {
                          option.selected = true;
                      }
                      statusSelect.appendChild(option);
                  });
                  statusCell.appendChild(statusSelect);

                  row.dataset.studentId = student.id;
              });
              saveAttendanceButton.style.display = 'block'; // Mostrar botón de guardar
          }
      } else {
          attendanceMessageDiv.textContent = data.message || 'Error al cargar la asistencia.';
          attendanceMessageDiv.classList.add('error');
      }
  } catch (error) {
      console.error(`Error de conexión al obtener asistencia para el curso ${courseId} y fecha ${date}:`, error);
      attendanceMessageDiv.textContent = 'Error de conexión. No se pudo cargar la asistencia.';
      attendanceMessageDiv.classList.add('error');
  }
}


 // Manejar clics en la lista de cursos (MODIFICADO para mostrar sección de asistencia)
 if (teacherCoursesList) {
  teacherCoursesList.addEventListener('click', (e) => {
      if (e.target.classList.contains('course-item')) {
          document.querySelectorAll('.course-item').forEach(item => {
              item.classList.remove('active');
          });
          e.target.classList.add('active');

          const courseId = parseInt(e.target.dataset.courseId);
          const courseName = e.target.dataset.courseName; // Obtener el nombre completo del curso

          if (courseId !== currentSelectedCourseId) {
              currentSelectedCourseId = courseId;
              currentSelectedCourseName = courseName;

              // Cargar estudiantes para calificaciones
              fetchStudentsInCourse(courseId, courseName);

              // Mostrar la sección de asistencia y actualizar su título
              attendanceManagementContainer.style.display = 'block';
              attendanceCourseNameHeader.textContent = `Gestión de Asistencia para ${courseName}:`;
              
              // Cargar la asistencia para la fecha actual por defecto
              fetchAttendance(currentSelectedCourseId, attendanceDateInput.value);
          }
      }
  });
}
// NUEVO: Manejar el clic en el nombre del estudiante para seleccionar para notificación
if (studentsInCourseTableBody) {
  studentsInCourseTableBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('selectable-student')) {
          const studentId = parseInt(e.target.dataset.studentId);
          const studentName = e.target.dataset.studentName;

          // Remover 'selected' de otras filas
          document.querySelectorAll('.selectable-student').forEach(cell => {
              cell.closest('tr').classList.remove('selected-for-notification');
          });

          // Añadir 'selected' a la fila clicada
          e.target.closest('tr').classList.add('selected-for-notification');

          currentSelectedStudentId = studentId;
          selectedStudentForNotificationDiv.textContent = `Estudiante seleccionado: ${studentName} (ID: ${studentId})`;
          sendNotificationButton.disabled = false; // Habilitar el botón
          sendNotificationContainer.style.display = 'block'; // Mostrar la sección de notificación
          notificationMessageArea.textContent = ''; // Limpiar mensajes anteriores
          notificationForm.reset(); // Limpiar el formulario
      }
  });
}

// Manejar el envío del formulario de calificaciones
if (gradesForm) {
  gradesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      studentsInCourseMessageDiv.textContent = 'Guardando calificaciones...';
      studentsInCourseMessageDiv.className = 'message-area info';

      const gradeUpdates = [];
      const rows = studentsInCourseTableBody.querySelectorAll('tr');

      rows.forEach(row => {
          const studentId = parseInt(row.dataset.studentId);
          const courseId = parseInt(row.dataset.courseId);
          const scoreInput = row.querySelector('.grade-input');
          const statusSelect = row.querySelector('.grade-status-select');

          if (scoreInput && statusSelect) {
              gradeUpdates.push({
                  studentId: studentId,
                  courseId: courseId,
                  score: scoreInput.value.trim(),
                  status: statusSelect.value
              });
          }
      });

      let allSuccess = true;
      for (const update of gradeUpdates) {
          try {
              const response = await fetch('/api/teacher/grades', {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(update)
              });

              const data = await response.json();

              if (!response.ok) {
                  allSuccess = false;
                  console.error(`Error al guardar calificación para estudiante ${update.studentId} en curso ${update.courseId}:`, data.message);
              }
          } catch (error) {
              allSuccess = false;
              console.error(`Error de conexión al guardar calificación para estudiante ${update.studentId} en curso ${update.courseId}:`, error);
          }
      }

      if (allSuccess) {
          studentsInCourseMessageDiv.textContent = 'Todas las calificaciones guardadas con éxito.';
          studentsInCourseMessageDiv.classList.add('success');
      } else {
          studentsInCourseMessageDiv.textContent = 'Hubo errores al guardar algunas calificaciones. Revisa la consola.';
          studentsInCourseMessageDiv.classList.add('warning');
      }
      // Recargar para reflejar los cambios
      setTimeout(() => {
          if (currentSelectedCourseId) {
              fetchStudentsInCourse(currentSelectedCourseId, currentSelectedCourseName);
          }
      }, 1000);
  });
}

// --- NUEVO: Manejar el clic del botón 'Cargar Asistencia' ---
if (loadAttendanceButton) {
  loadAttendanceButton.addEventListener('click', () => {
      if (currentSelectedCourseId && attendanceDateInput.value) {
          fetchAttendance(currentSelectedCourseId, attendanceDateInput.value);
      } else {
          attendanceMessageDiv.textContent = 'Selecciona un curso y una fecha para cargar la asistencia.';
          attendanceMessageDiv.classList.add('warning');
      }
  });
}

// --- NUEVO: Manejar el envío del formulario de asistencia ---
if (attendanceForm) {
  attendanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      attendanceMessageDiv.textContent = 'Guardando asistencia...';
      attendanceMessageDiv.className = 'message-area info';

      const attendanceUpdates = [];
      const rows = attendanceTableBody.querySelectorAll('tr');
      const dateToSave = attendanceDateInput.value;

      if (!currentSelectedCourseId || !dateToSave) {
          attendanceMessageDiv.textContent = 'Error: Curso o fecha no seleccionados.';
          attendanceMessageDiv.classList.add('error');
          return;
      }

      rows.forEach(row => {
          const studentId = parseInt(row.dataset.studentId);
          const statusSelect = row.querySelector('.attendance-status-select');

          if (statusSelect) {
              attendanceUpdates.push({
                  studentId: studentId,
                  status: statusSelect.value
              });
          }
      });

      try {
          const response = await fetch('/api/teacher/attendance', { // NUEVO ENDPOINT PUT para asistencia
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  courseId: currentSelectedCourseId,
                  date: dateToSave,
                  attendanceUpdates: attendanceUpdates
              })
          });

          const data = await response.json();

          if (response.ok) {
              attendanceMessageDiv.textContent = data.message || 'Asistencia guardada con éxito.';
              attendanceMessageDiv.classList.add('success');
          } else {
              attendanceMessageDiv.textContent = data.message || 'Error al guardar la asistencia.';
              attendanceMessageDiv.classList.add('error');
          }
      } catch (error) {
          console.error('Error de conexión al guardar asistencia:', error);
          attendanceMessageDiv.textContent = 'Error de conexión. No se pudo guardar la asistencia.';
          attendanceMessageDiv.classList.add('error');
      }
      // Opcional: Recargar la asistencia después de guardar
      setTimeout(() => {
          if (currentSelectedCourseId && attendanceDateInput.value) {
              fetchAttendance(currentSelectedCourseId, attendanceDateInput.value);
          }
      }, 1000);
  });
}




  // --- Manejar clics en la lista de cursos ---
  if (teacherCoursesList) {
      teacherCoursesList.addEventListener('click', (e) => {
          if (e.target.classList.contains('course-item')) {
              // Remover clase 'active' de todos los items
              document.querySelectorAll('.course-item').forEach(item => {
                  item.classList.remove('active');
              });

              // Añadir clase 'active' al item clicado
              e.target.classList.add('active');

              const courseId = parseInt(e.target.dataset.courseId);
              const courseName = e.target.textContent.split(' (')[0]; // Obtener solo el nombre sin el código

              if (courseId !== currentSelectedCourseId) {
                  currentSelectedCourseId = courseId;
                  fetchStudentsInCourse(courseId, courseName);
              }
          }
      });
  }
  // --- NUEVO: Manejar el envío del formulario de calificaciones ---
  if (gradesForm) {
    gradesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        studentsInCourseMessageDiv.textContent = 'Guardando calificaciones...';
        studentsInCourseMessageDiv.className = 'message-area info';

        // Recolectar todas las calificaciones y estados de la tabla
        const gradeUpdates = [];
        const rows = studentsInCourseTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const studentId = parseInt(row.dataset.studentId);
            const courseId = parseInt(row.dataset.courseId); // Obtener el courseId del dataset
            const scoreInput = row.querySelector('.grade-input');
            const statusSelect = row.querySelector('.grade-status-select');

            // Solo si encontramos los elementos
            if (scoreInput && statusSelect) {
                gradeUpdates.push({
                    studentId: studentId,
                    courseId: courseId, // Asegurarse de enviar el courseId
                    score: scoreInput.value.trim(),
                    status: statusSelect.value
                });
            }
        });

        // Enviar cada actualización individualmente al backend (o en un array si el backend lo soporta)
        // Para este ejemplo, lo haremos de forma individual para mayor claridad.
        let allSuccess = true;
        for (const update of gradeUpdates) {
            try {
                const response = await fetch('/api/teacher/grades', { // NUEVO ENDPOINT PUT
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(update)
                });

                const data = await response.json();

                if (!response.ok) {
                    allSuccess = false;
                    console.error(`Error al guardar calificación para estudiante ${update.studentId} en curso ${update.courseId}:`, data.message);
                    // Podrías añadir un mensaje específico al lado de la fila del estudiante con error
                }
            } catch (error) {
                allSuccess = false;
                console.error(`Error de conexión al guardar calificación para estudiante ${update.studentId} en curso ${update.courseId}:`, error);
            }
        }

        if (allSuccess) {
            studentsInCourseMessageDiv.textContent = 'Todas las calificaciones guardadas con éxito.';
            studentsInCourseMessageDiv.classList.add('success');
        } else {
            studentsInCourseMessageDiv.textContent = 'Hubo errores al guardar algunas calificaciones. Revisa la consola.';
            studentsInCourseMessageDiv.classList.add('warning');
        }

        // Opcional: Recargar los estudiantes para ver los cambios reflejados
        setTimeout(() => {
            if (currentSelectedCourseId) {
                // Obtener el nombre del curso activo para recargar la vista
                const activeCourseItem = document.querySelector('.course-item.active');
                const activeCourseName = activeCourseItem ? activeCourseItem.textContent.split(' (')[0] : '';
                fetchStudentsInCourse(currentSelectedCourseId, activeCourseName);
            }
        }, 1000); // Pequeño retraso para que el mensaje sea visible
    });
}


  // Inicializar: Cargar la lista de cursos del profesor al cargar la página
  fetchTeacherCourses();
});*/