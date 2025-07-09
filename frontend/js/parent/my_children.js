// frontend/js/parent/my_children.js

document.addEventListener('DOMContentLoaded', () => {
	const childrenMessageDiv = document.getElementById('childrenMessage');
	const addStudentForm = document.getElementById('addStudentForm');
	const childrenTableBody = document.getElementById('childrenTableBody');

	// Referencias a los campos del formulario de registro de hijo
	const childNameInput = document.getElementById('childName');
	const childLastnameInput = document.getElementById('childLastName');
	const childEmailInput = document.getElementById('childEmail');
	const childGradeInput = document.getElementById('childGrade');	
	const childBirthDateInput = document.getElementById('childBirthDate'); // <-- ¡Asegúrate de que el ID sea correcto!

	const enrolledCoursesTableBody = document.getElementById('enrolledCoursesTableBody');
	const enrolledCoursesMessageDiv = document.getElementById('enrolledCoursesMessage');


	const gradesTableBody = document.getElementById('gradesTableBody');
  const gradesMessageDiv = document.getElementById('gradesMessage');

    function showGradesMessage(message, type) {
        gradesMessageDiv.textContent = message;
        gradesMessageDiv.className = `message-area ${type}`;
    }
	// Función para mostrar mensajes
	function showMessage(message, type) {
			childrenMessageDiv.textContent = message;
			childrenMessageDiv.className = `message-area ${type}`;
	}
	

	async function loadStudentGrades(studentId) {
		gradesTableBody.innerHTML = '';
		showGradesMessage('Cargando calificaciones...', 'info');

		try {
				const parentId = localStorage.getItem('userId');
				if (!parentId) {
						showGradesMessage('Error: No se encontró el ID de usuario.', 'error');
						return;
				}

				const response = await fetch(`/api/parent/student/${studentId}/courses`, {
						headers: { 'X-User-ID': parentId }
				});
				const data = await response.json();

				console.log('Datos de calificaciones recibidos del backend:', data);

				if (response.ok) {
						showGradesMessage('', '');
						if (data.length === 0) {
								const row = gradesTableBody.insertRow();
								const cell = row.insertCell();
								cell.colSpan = 7; // Ajusta el colspan según el número de columnas
								cell.textContent = 'No hay calificaciones disponibles para tus hijos todavía.';
								cell.style.textAlign = 'center';
						} else {
								data.forEach(grade => {
										const row = gradesTableBody.insertRow();
										row.insertCell().textContent = grade.studentName;
										row.insertCell().textContent = grade.courseName;
										row.insertCell().textContent = grade.gradeName;
										row.insertCell().textContent = grade.evaluationType || 'N/A';
										row.insertCell().textContent = grade.score !== null ? grade.score.toFixed(2) : 'N/A';
										row.insertCell().textContent = grade.scoreDate ? new Date(grade.scoreDate).toLocaleDateString('es-ES') : 'N/A';
										row.insertCell().textContent = grade.observations || 'N/A';
								});
						}
				} else {
						showGradesMessage(data.message || 'Error al cargar calificaciones.', 'error');
				}
		} catch (error) {
				console.error('Error de conexión al cargar calificaciones:', error);
				showGradesMessage('Error de conexión al cargar calificaciones.', 'error');
		}
	}

	async function enrollStudent(studentId){
		const parentId = localStorage.getItem('userId');
		if (!parentId) {
				showMessage('Error: No se encontró el ID de usuario para registrar el hijo.', 'error');
				return;
		}

		const response = await fetch(`/api/parent/students/${studentId}/enroll`, {
				method: 'POST',
				headers: {
						'Content-Type': 'application/json',
						'X-User-ID': parentId
				},
				
		});
		showEnrolledCoursesMessage("Matriculado exitosamente.", "success")
		loadMyChildren()
 }
	
	function showEnrolledCoursesMessage(message, type) {
		enrolledCoursesMessageDiv.textContent = message;
		enrolledCoursesMessageDiv.className = `message-area ${type}`;
		}

// --- NUEVA FUNCIÓN: Cargar grados disponibles para el SELECT ---
	async function populateGradesForStudentRegistration() {
			try {
					const parentId = localStorage.getItem('userId');
						if (!parentId) {
								showMessage('Error: No se encontró el ID de usuario. Por favor, vuelve a iniciar sesión.', 'error');
								return;
						}
					const response = await fetch('/api/parent/grades', {
							headers: {
									'X-User-ID': parentId
							}
					}); // Llama a la nueva ruta del backend
					const data = await response.json();
					if (response.ok) {
							childGradeInput.innerHTML = '<option value="">Selecciona un grado</option>';
							data.forEach(grade => {
									const option = document.createElement('option');
									option.value = grade.id_grado; // Usar el ID del grado
									option.textContent = grade.nombre_grado; // Mostrar el nombre del grado
									childGradeInput.appendChild(option);
							});
					} else {
							showMessage(data.message || 'Error al cargar grados.', 'error');
					}
			} catch (error) {
					console.error('Error de conexión al cargar grados:', error);
					showMessage('Error de conexión al cargar grados.', 'error');
			}
	}

	// Función para cargar y mostrar los hijos del padre actual
	async function loadMyChildren() {
			childrenTableBody.innerHTML = ''; // Limpiar tabla
			showMessage('Cargando la lista de tus hijos...', 'info');
			try {
					const parentId = localStorage.getItem('userId');
					if (!parentId) {
							showMessage('Error: No se encontró el ID de usuario. Por favor, vuelve a iniciar sesión.', 'error');
							return;
					}
					const response = await fetch('/api/parent/my-students', {
							headers: {
									'X-User-ID': parentId
							}
					});
					const data = await response.json();
					// *** CONSOLE.LOG CLAVE AQUÍ: Verifica lo que el backend realmente envía ***
					showMessage('', '');
							console.log('Datos recibidos del backend:', data); // <-- AÑADE ESTO
					
					if (response.ok) {
							showMessage('', '');
							console.log('Datos recibidos del backend:', data); // <-- AÑADE ESTO

							if (data.length === 0) {
									const row = childrenTableBody.insertRow();
									const cell = row.insertCell();
									cell.colSpan = 8; // AHORA SON MÁS COLUMNAS (ID, Nombre, Email, Grado, Fecha Nacimiento, Estado, Fecha Registro, Acciones)
									cell.textContent = 'No tienes hijos/estudiantes registrados bajo tu cuenta.';
									cell.style.textAlign = 'center';
									return;
							}

							data.forEach(child => {
								const row = childrenTableBody.insertRow();
								row.insertCell().textContent = child.id;
								row.insertCell().textContent = child.name;
								row.insertCell().textContent = child.email;
								row.insertCell().textContent = child.grade;
								
								// AÑADIDO: Celdas para los nuevos campos
								row.insertCell().textContent = child.birthDate ? new Date(child.birthDate).toLocaleDateString('es-ES') : 'N/A'; // Fecha Nacimiento
								row.insertCell().textContent = child.status || 'N/A'; // Estado
								// Formatear Fecha Registro si existe, de lo contrario 'N/A'
								row.insertCell().textContent = child.registrationDate ? new Date(child.registrationDate).toLocaleDateString('es-ES') : 'N/A';
									
								const actionsCell = row.insertCell();
								if(child.isEnrolled){
									const showBtn = document.createElement('button')
									showBtn.textContent = 'Revisar Notas'
									showBtn.addEventListener('click', function(){
										window.location="/parent/student_courses.html"
									})
									actionsCell.appendChild(showBtn)
								} else {
									const enrollBtn = document.createElement('button')
									enrollBtn.textContent = 'Matricular'
									enrollBtn.addEventListener('click', function(){
										enrollStudent(child.id)
									})
									actionsCell.appendChild(enrollBtn)
								}
								
								/*actionsCell.innerHTML = `
								<button type="button" onClick="enrollStudent(${child.id})">Matricular</button>
								<button type="button" onClick="fn(${child.id})">Revisar Notas</button>
								`*/
									// Aquí podrías añadir botones para editar/eliminar hijos en el futuro
							});
					} else {
							showMessage(data.message || 'Error al cargar tus hijos.', 'error');
					}
				} catch (error) {
					console.error('Error de conexión al cargar hijos del padre:', error);
					showMessage('Error de conexión al cargar tus hijos.', 'error');
			}
	}
	// --- Función existente: loadEnrolledCourses (Añadir columnas para Grado, Estado, Monto) ---
	async function loadEnrolledCourses() {
			enrolledCoursesTableBody.innerHTML = '';
			
			showEnrolledCoursesMessage('Cargando inscripciones...', 'info');
			try {
					const parentId = localStorage.getItem('userId');
					if (!parentId) {
							showEnrolledCoursesMessage('Error: No se encontró el ID de usuario.', 'error');
							return;
					}
					const response = await fetch(`/api/parent/my-enrollments?parentId=${parentId}`, {
						headers: {
								'X-User-ID': parentId
						}
				});
					const data = await response.json();

					console.log('Datos de inscripciones recibidos del backend:', data);

					if (response.ok) {
							showEnrolledCoursesMessage('', '');
							if (data.length === 0) {
									const row = enrolledCoursesTableBody.insertRow();
									const cell = row.insertCell();
									cell.colSpan = 8; // Ajustar el número de columnas si añades más
									cell.textContent = 'Ninguno de tus hijos está inscrito en cursos todavía.';
									cell.style.textAlign = 'center';
							} else {
									data.forEach(enrollment => {
											const row = enrolledCoursesTableBody.insertRow();
											row.insertCell().textContent = enrollment.enrollmentId;
											row.insertCell().textContent = enrollment.studentName;
											row.insertCell().textContent = enrollment.courseName;
											row.insertCell().textContent = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES').split('T')[0] : 'N/A';
											row.insertCell().textContent = enrollment.gradeName || 'N/A'; // Nuevo: Nombre del grado
											row.insertCell().textContent = enrollment.enrollmentStatus || 'N/A'; // Nuevo: Estado de Inscripción
											row.insertCell().textContent = enrollment.enrollmentAmount !== null ? enrollment.enrollmentAmount.toFixed(2) : 'N/A'; // Nuevo: Monto
											const actionsCell = row.insertCell();
									})
							}
					} else {
							showEnrolledCoursesMessage(data.message || 'Error al cargar inscripciones.', 'error');
					}
			} catch (error) {
					console.error('Error de conexión al cargar inscripciones:', error);
					showEnrolledCoursesMessage('Error de conexión al cargar inscripciones.', 'error');
			}
	}

		// --- MANEJADOR DE ENVÍO DEL FORMULARIO DE AÑADIR ESTUDIANTE (AHORA CON id_grado) ---
	if (addStudentForm) {
			addStudentForm.addEventListener('submit', async (e) => {
					e.preventDefault();

					const studentData = {
							name: childNameInput.value.trim(),
							email: childEmailInput.value.trim(),
							lastname: childLastnameInput.value.trim(),
							// ¡AQUÍ ES DONDE CAPTURAMOS EL VALOR DEL SELECT!
							id_grado: childGradeInput.value.trim(), // Ahora childGradeInput.value contendrá el id_grado
							birthDate: childBirthDateInput.value.trim(),
					};

					// Validación para asegurar que se seleccionó un grado
					if (!studentData.id_grado) {
							showMessage('Por favor, selecciona un grado para el estudiante.', 'error');
							return;
					}

					showMessage('Registrando hijo/estudiante...', 'info');

					try {
							const parentId = localStorage.getItem('userId');
							if (!parentId) {
									showMessage('Error: No se encontró el ID de usuario para registrar el hijo.', 'error');
									return;
							}

							const response = await fetch('/api/parent/my-students', {
									method: 'POST',
									headers: {
											'Content-Type': 'application/json',
											'X-User-ID': parentId
									},
									body: JSON.stringify(studentData)
							});

							const result = await response.json();
							console.log('Respuesta del backend al registrar hijo:', result);

							if (response.ok) {
									showMessage(result.message, 'success');
									addStudentForm.reset();
									// Recargar tablas si es necesario
									loadMyChildren();
									// Si tienes una tabla de inscripciones, también recárgala:
									// loadEnrolledCourses();
							} else {
									showMessage(result.message || 'Error al registrar hijo/estudiante.', 'error');
							}
					} catch (error) {
							console.error('Error de conexión al registrar hijo/estudiante:', error);
							showMessage('Error de conexión al registrar hijo/estudiante.', 'error');
					}
			});
	}
/*
	// Manejador para el formulario de añadir estudiante (hijo)
	if (addStudentForm) {
		addStudentForm.addEventListener('submit', async (e) => {
			e.preventDefault();
	
			const studentData = {
					name: childNameInput.value.trim(),
					email: childEmailInput.value.trim(),
					grade: childGradeInput.value.trim(),
					birthDate: childBirthDateInput.value // <-- ¡Asegúrate de que se esté obteniendo el valor!
			};

					showMessage('Registrando hijo/estudiante...', 'info');

					try {
							const parentId = localStorage.getItem('userId');
							if (!parentId) {
									showMessage('Error: No se encontró el ID de usuario para registrar el hijo.', 'error');
									return;
							}

							const response = await fetch('/api/parent/my-students', {
									method: 'POST',
									headers: {
											'Content-Type': 'application/json',
											'X-User-ID': parentId
									},
									body: JSON.stringify(studentData)
							});

							const result = await response.json();
							console.log('Respuesta del backend al registrar hijo:', result);

							if (response.ok) {
									showMessage(result.message, 'success');
									addStudentForm.reset();
									loadMyChildren(); // Recargar la tabla para mostrar el nuevo hijo
							} else {
									showMessage(result.message || 'Error al registrar hijo/estudiante.', 'error');
							}
					} catch (error) {
							console.error('Error de conexión al registrar hijo/estudiante:', error);
							showMessage('Error de conexión al registrar hijo/estudiante.', 'error');
					}
			});
	}*/

		loadMyChildren(); // Si ya la tienes, mantenla
		populateGradesForStudentRegistration(); // ¡NUEVO! Llama a esta función al cargar la página
		loadEnrolledCourses();
});