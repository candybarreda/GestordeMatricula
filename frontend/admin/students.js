// frontend/js/admin/students.js
document.addEventListener('DOMContentLoaded', () => {
    const studentsTableBody = document.getElementById('studentsTableBody');
    const addStudentForm = document.getElementById('addStudentForm');
    const addStudentMessageDiv = document.getElementById('addStudentMessage');
    const studentsListMessageDiv = document.getElementById('studentsListMessage');

    // --- Variables para el formulario de edición ---
    const editStudentModal = document.getElementById('editStudentModal'); // Lo crearemos en el HTML
    const editStudentForm = document.getElementById('editStudentForm');
    const editStudentId = document.getElementById('editStudentId');
    const editStudentName = document.getElementById('editStudentName');
    const editStudentEmail = document.getElementById('editStudentEmail');
    const editStudentGrade = document.getElementById('editStudentGrade');
    const editStudentMessageDiv = document.getElementById('editStudentMessage');

    // Función para obtener y mostrar estudiantes
    async function fetchStudents() {
        studentsListMessageDiv.textContent = 'Cargando estudiantes...';
        studentsListMessageDiv.className = 'message-area info'; // Usar clase info

        try {
            const response = await fetch('/api/admin/students');
            const data = await response.json();

            if (response.ok) {
                studentsTableBody.innerHTML = ''; // Limpiar tabla
                if (data.length === 0) {
                    studentsListMessageDiv.textContent = 'No hay estudiantes registrados aún.';
                    studentsListMessageDiv.classList.add('info');
                } else {
                    studentsListMessageDiv.textContent = '';
                    studentsListMessageDiv.className = 'message-area'; // Resetear clases
                    data.forEach(student => {
                        const row = studentsTableBody.insertRow();
                        row.dataset.id = student.id; // Guarda el ID en la fila para fácil acceso
                        row.insertCell().textContent = student.id;
                        row.insertCell().textContent = student.name;
                        row.insertCell().textContent = student.email;
                        row.insertCell().textContent = student.grade;

                        const actionsCell = row.insertCell();
                        actionsCell.innerHTML = `
                            <button class="btn btn-sm btn-edit" data-id="${student.id}"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-sm btn-delete" data-id="${student.id}"><i class="fas fa-trash"></i> Eliminar</button>
                        `;
                    });
                }
            } else {
                studentsListMessageDiv.textContent = data.message || 'Error al cargar estudiantes.';
                studentsListMessageDiv.classList.add('error');
            }
        } catch (error) {
            console.error('Error de conexión al obtener estudiantes:', error);
            studentsListMessageDiv.textContent = 'Error de conexión. No se pudieron cargar los estudiantes.';
            studentsListMessageDiv.classList.add('error');
        }
    }

    // Manejar el envío del formulario para añadir estudiante
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            addStudentMessageDiv.textContent = '';
            addStudentMessageDiv.className = 'message-area';

            const name = document.getElementById('studentName').value;
            const email = document.getElementById('studentEmail').value;
            const grade = document.getElementById('studentGrade').value;

            try {
                const response = await fetch('/api/admin/students', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, grade }),
                });

                const data = await response.json();

                if (response.ok) {
                    addStudentMessageDiv.textContent = data.message || 'Estudiante añadido con éxito.';
                    addStudentMessageDiv.classList.add('success');
                    addStudentForm.reset();
                    fetchStudents(); // Recargar la lista
                } else {
                    addStudentMessageDiv.textContent = data.message || 'Error al añadir estudiante.';
                    addStudentMessageDiv.classList.add('error');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor al añadir estudiante:', error);
                addStudentMessageDiv.textContent = 'Error de conexión. No se pudo añadir el estudiante.';
                addStudentMessageDiv.classList.add('error');
            }
        });
    }

    // --- Manejo de la tabla de estudiantes (Editar/Eliminar) ---
    if (studentsTableBody) {
        studentsTableBody.addEventListener('click', async (e) => {
            // Lógica para el botón de ELIMINAR
            if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
                const button = e.target.closest('.btn-delete');
                const studentId = button.dataset.id;
                if (confirm(`¿Estás seguro de que quieres eliminar al estudiante con ID ${studentId}?`)) {
                    try {
                        const response = await fetch(`/api/admin/students/${studentId}`, {
                            method: 'DELETE',
                        });

                        const data = await response.json();

                        if (response.ok) {
                            alert(data.message || 'Estudiante eliminado con éxito.');
                            fetchStudents(); // Recargar la lista
                        } else {
                            alert(data.message || 'Error al eliminar estudiante.');
                        }
                    } catch (error) {
                        console.error('Error al conectar con el servidor al eliminar:', error);
                        alert('Error de conexión. No se pudo eliminar el estudiante.');
                    }
                }
            }

            // Lógica para el botón de EDITAR
            if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
                const button = e.target.closest('.btn-edit');
                const studentId = button.dataset.id;
                
                // Buscar los datos del estudiante en la tabla (o hacer una nueva petición GET /api/admin/students/:id)
                // Para simplificar, obtenemos los datos de la fila de la tabla
                const row = button.closest('tr');
                const cells = row.querySelectorAll('td');
                
                editStudentId.value = studentId;
                editStudentName.value = cells[1].textContent;
                editStudentEmail.value = cells[2].textContent;
                editStudentGrade.value = cells[3].textContent;
                
                editStudentMessageDiv.textContent = ''; // Limpiar mensajes
                editStudentMessageDiv.className = 'message-area';
                if (editStudentModal) {
                    editStudentModal.style.display = 'block'; // Mostrar el modal
                }
            }
        });
    }

    // --- Manejo del formulario de edición dentro del modal ---
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            editStudentMessageDiv.textContent = 'Guardando cambios...';
            editStudentMessageDiv.className = 'message-area info';

            const id = editStudentId.value;
            const name = editStudentName.value;
            const email = editStudentEmail.value;
            const grade = editStudentGrade.value;

            try {
                const response = await fetch(`/api/admin/students/${id}`, {
                    method: 'PUT', // Usamos PUT para actualizar
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, grade }),
                });

                const data = await response.json();

                if (response.ok) {
                    editStudentMessageDiv.textContent = data.message || 'Estudiante actualizado con éxito.';
                    editStudentMessageDiv.classList.add('success');
                    // Opcional: Cerrar el modal después de un tiempo o dejar que el usuario lo cierre
                    setTimeout(() => {
                        if (editStudentModal) editStudentModal.style.display = 'none';
                        fetchStudents(); // Recargar la lista para ver los cambios
                    }, 1000);
                } else {
                    editStudentMessageDiv.textContent = data.message || 'Error al actualizar estudiante.';
                    editStudentMessageDiv.classList.add('error');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor al actualizar:', error);
                editStudentMessageDiv.textContent = 'Error de conexión. No se pudo actualizar el estudiante.';
                editStudentMessageDiv.classList.add('error');
            }
        });
    }

    // --- Cerrar modal de edición (cuando se haga clic fuera o en un botón de cerrar) ---
    if (editStudentModal) {
        // Asumiendo que tienes un botón o un área para cerrar el modal
        // Si no, puedes añadir un botón con id="closeModal" y añadir este listener
        editStudentModal.addEventListener('click', (e) => {
            if (e.target === editStudentModal || e.target.classList.contains('close-modal-btn')) {
                editStudentModal.style.display = 'none';
            }
        });
    }


    // Llamar a fetchStudents cuando la página se cargue
    fetchStudents();
});