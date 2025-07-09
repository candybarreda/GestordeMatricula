// src/routes/admin.js
const express = require('express');
const router = express.Router();
const { connectDb, executeProcedure } = require('../db');
 // Importa la conexión SQL


// Base de datos simulada de estudiantes
let students = [
    // El 'studentUserId' aquí se refiere al 'id' de un usuario en el array 'users'
    // 'status' será 'Activo' por defecto al registrar
    // 'registrationDate' será la fecha en que se añade
    // 'withdrawalDate' será nulo por defecto
    {
        id: 1,
        name: 'Ana García',
        email: 'ana.g@example.com',
        grade: '1er Grado',
        parentId: 2, // ID del usuario padre
        birthDate: '2018-03-15', // FechaNacimiento
        studentUserId: 4, // UsuarioID - ID del usuario asociado a este estudiante (ej: 'student_user')
        status: 'Activo', // Estado textual
        registrationDate: '2023-09-01T10:00:00Z', // FechaRegistro
        withdrawalDate: null // FechaRetiro
    },
    {
        id: 2,
        name: 'Luis Pérez',
        email: 'luis.p@example.com',
        grade: '2do Grado',
        parentId: 2,
        birthDate: '2017-07-20',
        studentUserId: null, // Podría ser null si aún no tiene cuenta de usuario propia
        status: 'Activo',
        registrationDate: '2023-09-01T10:15:00Z',
        withdrawalDate: null
    },
    {
        id: 3,
        name: 'Sofía Martínez',
        email: 'sofia.m@example.com',
        grade: 'Kinder',
        parentId: 2,
        birthDate: '2020-11-05',
        studentUserId: null,
        status: 'Activo',
        registrationDate: '2024-01-10T09:30:00Z',
        withdrawalDate: null
    },
    {
        id: 4,
        name: 'Carlos Díaz',
        email: 'carlos.d@example.com',
        grade: '3er Grado',
        parentId: 2,
        birthDate: '2016-01-25',
        studentUserId: null,
        status: 'Activo',
        registrationDate: '2023-09-01T11:00:00Z',
        withdrawalDate: null
    },
];

let nextStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;

let courses = [
  { id: 101, name: 'Matemáticas I', code: 'MAT101', credits: 3 },
  { id: 102, name: 'Lenguaje y Comunicación', code: 'LEN102', credits: 4 },
  { id: 103, name: 'Historia del Perú', code: 'HIS103', credits: 3 },
];
let nextCourseId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 100; // Comenzar con IDs más altos

// NUEVA BASE DE DATOS SIMULADA: Inscripciones
let enrollments = [
    { id: 1, studentId: 1, courseId: 101 }, // Ana García inscrita en Matemáticas I
    { id: 2, studentId: 1, courseId: 102 }, // Ana García inscrita en Lenguaje
    { id: 3, studentId: 2, courseId: 101 }, // Luis Pérez inscrito en Matemáticas I
];
let nextEnrollmentId = enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1;

// NUEVA BASE DE DATOS SIMULADA: Usuarios (¡Copia de la de auth.js para este prototipo!)
// En un sistema real, ambas rutas accederían a una base de datos centralizada.

let users = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { id: 2, username: 'parent_user', email: 'parent@example.com', password: 'password123', role: 'Parent' },
    { id: 3, username: 'teacher_user', email: 'teacher@example.com', password: 'password123', role: 'Teacher' },
    { id: 4, username: 'student_user', email: 'student@example.com', password: 'password123', role: 'Student' }, // Este es el UsuarioID para Ana García
    { id: 5, username: 'another_student', email: 'another@example.com', password: 'password123', role: 'Student' } // Y así, otros IDs para futuros estudiantes
];
let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

let messages = [
    { id: 1, senderId: 3, recipientId: 2, studentId: 4, subject: 'Progreso de Carlos en Matemáticas', content: 'Carlos ha mostrado una gran mejora en las últimas semanas en Matemáticas. ¡Felicidades!', date: '2025-06-18T10:00:00Z', read: false }, // Teacher (3) to Parent (2) about Student (4)
    { id: 2, senderId: 2, recipientId: 3, studentId: 4, subject: 'Re: Progreso de Carlos en Matemáticas', content: 'Muchas gracias, Profesor! Nos alegra mucho escucharlo. Estamos trabajando con él en casa.', date: '2025-06-18T10:30:00Z', read: false }, // Parent (2) to Teacher (3) about Student (4)
    { id: 3, senderId: 1, recipientId: 3, studentId: null, subject: 'Reunión de Profesores', content: 'Recordatorio: Reunión de profesores el viernes a las 3 PM en la sala de juntas.', date: '2025-06-18T09:00:00Z', read: true }, // Admin (1) to Teacher (3)
    { id: 4, senderId: 3, recipientId: 4, studentId: null, subject: 'Tarea de Lenguaje', content: 'Sofía, recuerda entregar la tarea de Lenguaje para mañana.', date: '2025-06-18T11:00:00Z', read: false } // Teacher (3) to Student (4)
];

let courseAssignments = [
    { courseId: 101, teacherId: 3 }, // Matemáticas I asignada al Teacher (ID 3)
    { courseId: 102, teacherId: 3 }, // Lenguaje y Comunicación asignada al Teacher (ID 3)
    { courseId: 103, teacherId: 3 }  // Historia del Perú asignada al Teacher (ID 3)
];
// Middleware de ejemplo para verificar si el usuario es Admin
function isAdmin(req, res, next) {
  console.log('Verificando si el usuario es Admin (simulado)... OK');
  next();
}

// --- Rutas de Gestión de Estudiantes (Ya existentes) ---

router.get('/students', isAdmin, (req, res) => { /* ... */ res.status(200).json(students); });
router.post('/students', isAdmin, (req, res) => { /* ... */ });
router.put('/students/:id', isAdmin, (req, res) => { /* ... */ });
router.delete('/students/:id', isAdmin, (req, res) => { /* ... */ });


// Ruta para obtener todos los estudiantes
router.get('/students', isAdmin, (req, res) => {
    console.log('Solicitud GET /api/admin/students recibida.');
    res.status(200).json(students);
});


// Ruta para obtener todos los cursos
router.get('/courses', isAdmin, (req, res) => {
  console.log('Solicitud GET /api/admin/courses recibida.');
  res.status(200).json(courses);
});


// Ruta para añadir un nuevo curso
router.post('/courses', isAdmin, (req, res) => {
  console.log('Solicitud POST /api/admin/courses recibida. Body:', req.body);
  const { name, code, credits } = req.body;

  if (!name || !code || !credits) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios: Nombre, Código, Créditos.' });
  }
  if (typeof credits !== 'number' || credits < 1) {
      return res.status(400).json({ message: 'Los créditos deben ser un número válido mayor o igual a 1.' });
  }

  const existingCourse = courses.find(c => c.code === code);
  if (existingCourse) {
      return res.status(409).json({ message: 'Ya existe un curso con ese código.' });
  }

  const newCourse = { id: nextCourseId++, name, code, credits };
  courses.push(newCourse);
  console.log('Nuevo curso añadido:', newCourse);
  res.status(201).json({ message: 'Curso añadido con éxito', course: newCourse });
});
// --- NUEVAS RUTAS: Gestión de Inscripciones ---

// Ruta para obtener todas las inscripciones (con detalles de estudiante y curso)
router.get('/enrollments', isAdmin, (req, res) => {
    console.log('Solicitud GET /api/admin/enrollments recibida.');
    const detailedEnrollments = enrollments.map(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        const course = courses.find(c => c.id === enrollment.courseId);
        return {
            id: enrollment.id,
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            studentName: student ? student.name : 'Desconocido',
            courseName: course ? course.name : 'Desconocido',
        };
    });
    res.status(200).json(detailedEnrollments);
});

// Ruta para crear una nueva inscripción
router.post('/enrollments', isAdmin, (req, res) => {
    console.log('Solicitud POST /api/admin/enrollments recibida. Body:', req.body);
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
        return res.status(400).json({ message: 'Se requiere Student ID y Course ID para la inscripción.' });
    }

    const student = students.find(s => s.id === studentId);
    const course = courses.find(c => c.id === courseId);

    if (!student) {
        return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }
    if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    // Validación: Evitar inscripciones duplicadas para el mismo estudiante en el mismo curso
    const existingEnrollment = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existingEnrollment) {
        return res.status(409).json({ message: 'Este estudiante ya está inscrito en este curso.' });
    }

    const newEnrollment = { id: nextEnrollmentId++, studentId, courseId };
    enrollments.push(newEnrollment);
    console.log('Nueva inscripción creada:', newEnrollment);
    res.status(201).json({ message: 'Inscripción realizada con éxito', enrollment: newEnrollment });
});

// Ruta para eliminar una inscripción
router.delete('/enrollments/:id', isAdmin, (req, res) => {
    const enrollmentId = parseInt(req.params.id);

    const initialLength = enrollments.length;
    enrollments = enrollments.filter(e => e.id !== enrollmentId);

    if (enrollments.length === initialLength) {
        console.log(`Inscripción con ID ${enrollmentId} no encontrada para eliminar.`);
        return res.status(404).json({ message: 'Inscripción no encontrada.' });
    }

    console.log(`Inscripción con ID ${enrollmentId} eliminada.`);
    res.status(200).json({ message: 'Inscripción eliminada con éxito.' });
});

// Ruta para actualizar un curso (PUT)
router.put('/courses/:id', isAdmin, (req, res) => {
  const courseId = parseInt(req.params.id);
  const { name, code, credits } = req.body;

  const courseIndex = courses.findIndex(c => c.id === courseId);

  if (courseIndex === -1) {
      console.log(`Curso con ID ${courseId} no encontrado para actualizar.`);
      return res.status(404).json({ message: 'Curso no encontrado.' });
  }

  if (!name || !code || !credits) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios: Nombre, Código, Créditos.' });
  }
  if (typeof credits !== 'number' || credits < 1) {
      return res.status(400).json({ message: 'Los créditos deben ser un número válido mayor o igual a 1.' });
  }

  const existingCourseWithCode = courses.find(c => c.code === code && c.id !== courseId);
  if (existingCourseWithCode) {
      return res.status(409).json({ message: 'Este código de curso ya está en uso por otro curso.' });
  }

  courses[courseIndex] = { ...courses[courseIndex], name, code, credits };
  console.log(`Curso con ID ${courseId} actualizado:`, courses[courseIndex]);
  res.status(200).json({ message: 'Curso actualizado con éxito', course: courses[courseIndex] });
});

// Ruta para añadir un nuevo estudiante
router.post('/students', isAdmin, (req, res) => {
    console.log('Solicitud POST /api/admin/students recibida. Body:', req.body);
    const { name, email, grade } = req.body;

    if (!name || !email || !grade) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios: Nombre, Email, Grado.' });
    }

    const existingStudent = students.find(s => s.email === email);
    if (existingStudent) {
        return res.status(409).json({ message: 'Ya existe un estudiante con ese correo electrónico.' });
    }

    const newStudent = { id: nextStudentId++, name, email, grade };
    students.push(newStudent);
    console.log('Nuevo estudiante añadido:', newStudent);
    res.status(201).json({ message: 'Estudiante añadido con éxito', student: newStudent });
});

// NUEVA RUTA: Ruta para actualizar un estudiante (PUT)
router.put('/students/:id', isAdmin, (req, res) => {
    const studentId = parseInt(req.params.id); // Convertir el ID de la URL a número
    const { name, email, grade } = req.body;

    const studentIndex = students.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
        console.log(`Estudiante con ID ${studentId} no encontrado para actualizar.`);
        return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }

    if (!name || !email || !grade) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios: Nombre, Email, Grado.' });
    }

    // Opcional: Validar que el nuevo email no pertenezca a otro estudiante
    const existingStudentWithEmail = students.find(s => s.email === email && s.id !== studentId);
    if (existingStudentWithEmail) {
        return res.status(409).json({ message: 'Este correo electrónico ya está en uso por otro estudiante.' });
    }

    students[studentIndex] = { ...students[studentIndex], name, email, grade }; // Actualizar los campos
    console.log(`Estudiante con ID ${studentId} actualizado:`, students[studentIndex]);
    res.status(200).json({ message: 'Estudiante actualizado con éxito', student: students[studentIndex] });
});

// NUEVA RUTA: Ruta para eliminar un estudiante (DELETE)
router.delete('/students/:id', isAdmin, (req, res) => {
    const studentId = parseInt(req.params.id); // Convertir el ID de la URL a número

    const initialLength = students.length;
    students = students.filter(s => s.id !== studentId); // Crear un nuevo array sin el estudiante eliminado

    if (students.length === initialLength) {
        console.log(`Estudiante con ID ${studentId} no encontrado para eliminar.`);
        return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }

    console.log(`Estudiante con ID ${studentId} eliminado.`);
    res.status(200).json({ message: 'Estudiante eliminado con éxito.' });
});


// Ruta para eliminar un curso (DELETE)
router.delete('/courses/:id', isAdmin, (req, res) => {
  const courseId = parseInt(req.params.id);

  const initialLength = courses.length;
  courses = courses.filter(c => c.id !== courseId);

  if (courses.length === initialLength) {
      console.log(`Curso con ID ${courseId} no encontrado para eliminar.`);
      return res.status(404).json({ message: 'Curso no encontrado.' });
  }

  console.log(`Curso con ID ${courseId} eliminado.`);
  res.status(200).json({ message: 'Curso eliminado con éxito.' });
});


// Ruta para eliminar un curso (DELETE)
router.delete('/courses/:id', isAdmin, (req, res) => {
  const courseId = parseInt(req.params.id);

  const initialLength = courses.length;
  courses = courses.filter(c => c.id !== courseId);

  if (courses.length === initialLength) {
      console.log(`Curso con ID ${courseId} no encontrado para eliminar.`);
      return res.status(404).json({ message: 'Curso no encontrado.' });
  }

  console.log(`Curso con ID ${courseId} eliminado.`);
  res.status(200).json({ message: 'Curso eliminado con éxito.' });
});



// Ruta para obtener todos los usuarios
router.get('/users', isAdmin, (req, res) => {
    console.log('Solicitud GET /api/admin/users recibida.');
    // Excluir la contraseña por seguridad al enviarla al frontend
    const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
    res.status(200).json(usersWithoutPasswords);
});

// Ruta para actualizar un usuario (PUT) - solo nombre, email, rol
router.put('/users/:id', isAdmin, (req, res) => {
    const userId = parseInt(req.params.id);
    const { username, email, role } = req.body; // No permitimos cambiar la contraseña directamente aquí

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        console.log(`Usuario con ID ${userId} no encontrado para actualizar.`);
        return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Todos los campos (nombre de usuario, email, rol) son obligatorios.' });
    }

    // Opcional: Validar que el nuevo email no pertenezca a otro usuario
    const existingUserWithEmail = users.find(u => u.email === email && u.id !== userId);
    if (existingUserWithEmail) {
        return res.status(409).json({ message: 'Este correo electrónico ya está en uso por otro usuario.' });
    }
    
    // Validar el rol
    const validRoles = ['Admin', 'Parent', 'Teacher', 'Student'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol de usuario inválido.' });
    }

    // Actualizar los campos del usuario
    users[userIndex] = { ...users[userIndex], username, email, role };
    console.log(`Usuario con ID ${userId} actualizado:`, users[userIndex]);

    // Devolver el usuario actualizado sin la contraseña
    const { password, ...updatedUserWithoutPassword } = users[userIndex];
    res.status(200).json({ message: 'Usuario actualizado con éxito', user: updatedUserWithoutPassword });
});

// Ruta para eliminar un usuario (DELETE)
router.delete('/users/:id', isAdmin, (req, res) => {
    const userId = parseInt(req.params.id);

    const initialLength = users.length;
    users = users.filter(u => u.id !== userId); // Eliminar el usuario del array

    if (users.length === initialLength) {
        console.log(`Usuario con ID ${userId} no encontrado para eliminar.`);
        return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log(`Usuario con ID ${userId} eliminado.`);
    res.status(200).json({ message: 'Usuario eliminado con éxito.' });
});


// --- Rutas para la Gestión de Asignación de Cursos a Profesores ---

// GET /api/admin/course-assignments - Obtener todas las asignaciones de cursos
router.get('/course-assignments', isAdmin, (req, res) => {
    try {
        const assignmentsWithDetails = courseAssignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.courseId);
            const teacher = users.find(u => u.id === assignment.teacherId && u.role === 'Teacher');
            return {
                courseId: assignment.courseId,
                courseName: course ? course.name : 'Curso Desconocido',
                teacherId: assignment.teacherId,
                teacherName: teacher ? teacher.username : 'Profesor Desconocido'
            };
        });
        res.status(200).json(assignmentsWithDetails);
    } catch (error) {
        console.error('Error al obtener asignaciones de cursos:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// POST /api/admin/course-assignments - Asignar un profesor a un curso
router.post('/course-assignments', isAdmin, (req, res) => {
    const { courseId, teacherId } = req.body;

    if (!courseId || !teacherId) {
        return res.status(400).json({ message: 'Se requieren courseId y teacherId.' });
    }

    const courseExists = courses.some(c => c.id === courseId);
    if (!courseExists) {
        return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    const teacherExists = users.some(u => u.id === teacherId && u.role === 'Teacher');
    if (!teacherExists) {
        return res.status(404).json({ message: 'Profesor no encontrado o no tiene el rol de Profesor.' });
    }

    const assignmentExists = courseAssignments.some(a => a.courseId === courseId);
    if (assignmentExists) {
        return res.status(409).json({ message: 'Este curso ya tiene un profesor asignado. Por favor, desasigne primero.' });
    }

    const newAssignment = { courseId, teacherId };
    courseAssignments.push(newAssignment);
    res.status(201).json({ message: 'Profesor asignado al curso con éxito.', assignment: newAssignment });
});

// DELETE /api/admin/course-assignments/:courseId - Desasignar un profesor de un curso
router.delete('/course-assignments/:courseId', isAdmin, (req, res) => {
    const courseId = parseInt(req.params.courseId);

    const initialLength = courseAssignments.length;
    courseAssignments = courseAssignments.filter(a => a.courseId !== courseId);

    if (courseAssignments.length < initialLength) {
        res.status(200).json({ message: 'Asignación eliminada con éxito.' });
    } else {
        res.status(404).json({ message: 'Asignación no encontrada para este curso.' });
    }
});

// GET /api/admin/available-courses - Obtener cursos sin asignar
router.get('/available-courses', isAdmin, (req, res) => {
    try {
        const assignedCourseIds = new Set(courseAssignments.map(a => a.courseId));
        const availableCourses = courses.filter(c => !assignedCourseIds.has(c.id));
        res.status(200).json(availableCourses);
    } catch (error) {
        console.error('Error al obtener cursos disponibles:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// GET /api/admin/teachers - Obtener solo los usuarios con rol de "Teacher"
router.get('/teachers', isAdmin, (req, res) => {
    try {
        const teachers = users.filter(u => u.role === 'Teacher').map(t => ({ id: t.id, username: t.username }));
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error al obtener la lista de profesores:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
// RUTA POST /api/parent/my-students - Para que un padre registre a sus hijos

  /*  router.post('/my-students', isParent, async (req, res) => { // Marca como 'async'
    const parentId = req.user.id;
    const { name, email, grade, birthDate } = req.body;

    if (!name || !email || !grade || !birthDate) {
        return res.status(400).json({ message: 'Todos los campos (nombre, email, grado, fecha de nacimiento) son obligatorios para el estudiante.' });
    }

    try {
        // Verificar si el email ya existe
        const request = new sql.Request();
        request.input('email', sql.NVarChar(255), email);
        const result = await request.query('SELECT EstudianteID FROM Estudiantes WHERE Email = @email');

        if (result.recordset.length > 0) {
            return res.status(409).json({ message: 'Ya existe un estudiante con este email en el sistema.' });
        }

        // Insertar el nuevo estudiante
        request.input('name', sql.NVarChar(100), name);
        request.input('email', sql.NVarChar(255), email);
        request.input('grade', sql.NVarChar(50), grade);
        request.input('birthDate', sql.Date, birthDate);
        request.input('parentId', sql.Int, parentId);
        // studentUserId, Status, RegistrationDate, WithdrawalDate se manejan en la tabla SQL

        const insertResult = await request.query(`
            INSERT INTO Estudiantes (Nombres, Email, Grado, FechaNacimiento, ParentUsuarioID, Estado, FechaRegistro, FechaRetiro)
            VALUES (@name, @email, @grade, @birthDate, @parentId, 'Activo', GETDATE(), NULL);
            SELECT SCOPE_IDENTITY() AS EstudianteID; -- Para obtener el ID del estudiante recién insertado
        `);

        const newStudentId = insertResult.recordset[0].EstudianteID;

        // Puedes opcionalmente obtener el estudiante completo para devolverlo
        const newStudent = {
            id: newStudentId,
            name,
            email,
            grade,
            parentId,
            birthDate,
            studentUserId: null, // Si no creas un usuario en la tabla Usuarios aún
            status: 'Activo',
            registrationDate: new Date().toISOString(),
            withdrawalDate: null
        };

        res.status(201).json({
            message: 'Hijo/Estudiante registrado con éxito.',
            student: newStudent
        });

    } catch (err) {
        console.error('Error al registrar estudiante:', err);
        res.status(500).json({ message: 'Error interno del servidor al registrar estudiante.' });
    }
});

// RUTA GET /api/parent/my-students - Para que el padre vea a sus hijos
router.get('/my-students', isParent, async (req, res) => { // Marca como 'async'
    const parentId = req.user.id;

    try {
        const request = new sql.Request();
        request.input('parentId', sql.Int, parentId);
        const result = await request.query('SELECT EstudianteID AS id, Nombres AS name, Email AS email, Grado AS grade, FechaNacimiento AS birthDate, ParentUsuarioID AS parentId, StudentUsuarioID AS studentUserId, Estado AS status, FechaRegistro AS registrationDate, FechaRetiro AS withdrawalDate FROM Estudiantes WHERE ParentUsuarioID = @parentId');

        const parentStudents = result.recordset; // Los resultados de la consulta

        if (parentStudents.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(parentStudents);
    } catch (err) {
        console.error('Error al obtener hijos del padre:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener hijos.' });
    }
});*/

module.exports = router;