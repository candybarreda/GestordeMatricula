// src/routes/teacher.js
const express = require('express');
const router = express.Router();
const { connectDb, executeProcedure } = require('../db');
// --- Copias de las bases de datos simuladas ---
// Es importante que estas bases de datos estén actualizadas y sean consistentes.
// En una aplicación real, todos accederían a una base de datos centralizada.

let users = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { id: 2, username: 'parent_user', email: 'parent@example.com', password: 'password123', role: 'Parent' },
    { id: 3, username: 'teacher_user', email: 'teacher@example.com', password: 'password123', role: 'Teacher' },
    { id: 4, username: 'student_user', email: 'student@example.com', password: 'password123', role: 'Student' }, // Este es el UsuarioID para Ana García
    { id: 5, username: 'another_student', email: 'another@example.com', password: 'password123', role: 'Student' } // Y así, otros IDs para futuros estudiantes
];

// MODIFICACIÓN IMPORTANTE AQUÍ: La estructura de estudiantes
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


let courses = [
    { id: 101, name: 'Matemáticas I', code: 'MAT101', credits: 3 },
    { id: 102, name: 'Lenguaje y Comunicación', code: 'LEN102', credits: 4 },
    { id: 103, name: 'Historia del Perú', code: 'HIS103', credits: 3 },
    { id: 104, name: 'Educación Física', code: 'EF104', credits: 2 },
];

let enrollments = [
    { id: 1, studentId: 1, courseId: 101 }, // Ana García en Matemáticas I
    { id: 2, studentId: 1, courseId: 102 }, // Ana García en Lenguaje
    { id: 3, studentId: 2, courseId: 101 }, // Luis Pérez en Matemáticas I
    { id: 4, studentId: 4, courseId: 101 }, // Carlos Díaz en Matemáticas I
    { id: 5, studentId: 4, courseId: 103 }, // Carlos Díaz en Historia del Perú
    { id: 6, studentId: 4, courseId: 104 }, // Carlos Díaz en Educación Física
];

// --- NUEVO: Simulación de asignación de profesores a cursos ---
// { teacherId: user.id, courseId: course.id }
let teacherCourseAssignments = [
    { teacherId: 3, courseId: 101 }, // teacher_user (ID 3) imparte Matemáticas I
    { teacherId: 3, courseId: 103 }, // teacher_user (ID 3) imparte Historia del Perú
    // Puedes añadir más asignaciones si tienes otros profesores simulados
];

let grades = [
  { studentId: 1, courseId: 101, score: 85, status: 'Completado' },
  { studentId: 1, courseId: 102, score: 92, status: 'Completado' },
  { studentId: 2, courseId: 101, score: 78, status: 'Completado' },
  { studentId: 4, courseId: 101, score: 90, status: 'Completado' },
  { studentId: 4, courseId: 103, score: 'En progreso', status: 'En Curso' },
  { studentId: 4, courseId: 104, score: 95, status: 'Completado' },
];

// --- NUEVO: Simulación de datos de asistencia ---
// { courseId: N, studentId: M, date: 'YYYY-MM-DD', status: 'Presente' | 'Ausente' | 'Tardanza' | 'Justificado' }
let attendanceRecords = [
    { courseId: 101, studentId: 1, date: '2025-06-16', status: 'Presente' },
    { courseId: 101, studentId: 2, date: '2025-06-16', status: 'Ausente' },
    { courseId: 101, studentId: 4, date: '2025-06-16', status: 'Presente' },
    { courseId: 103, studentId: 4, date: '2025-06-16', status: 'Presente' },
];


// --- NUEVO: Simulación de datos de notificaciones ---
// { id: uniqueId, senderId: userId, recipientId: parentUserId, studentId: studentId (opcional),
//   title: '...', message: '...', date: 'YYYY-MM-DDTHH:MM:SSZ', read: boolean }
let notifications = [
    { id: 1, senderId: 3, recipientId: 2, studentId: 4, title: 'Calificación de Matemáticas I', message: 'Carlos obtuvo 90 en el último examen de Matemáticas.', date: '2025-06-17T10:00:00Z', read: false },
    { id: 2, senderId: 3, recipientId: 2, studentId: 2, title: 'Asistencia de Lenguaje', message: 'Luis estuvo ausente en la clase de Lenguaje del 16/06.', date: '2025-06-17T10:05:00Z', read: false },
    { id: 3, senderId: 1, recipientId: 2, studentId: null, title: 'Recordatorio General', message: 'Mañana no habrá clases por feriado.', date: '2025-06-16T15:00:00Z', read: true }, // Notificación de un admin
];
let nextNotificationId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;


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
// Middleware para verificar autenticación y rol de 'Teacher'
function isTeacher(req, res, next) {
    console.log('Verificando si el usuario es Teacher (simulado)...');
    // Asumimos que el usuario logueado para estas rutas es 'teacher_user' (ID 3).
    const simulatedUserId = 3; // ID del usuario con rol 'Teacher'
    const authenticatedUser = users.find(u => u.id === simulatedUserId);

    if (authenticatedUser && authenticatedUser.role === 'Teacher') {
        req.user = authenticatedUser; // Adjunta el objeto de usuario completo
        console.log(`Usuario ${req.user.username} (ID: ${req.user.id}) autenticado como Teacher.`);
        next();
    } else {
        console.warn(`Intento de acceso no autorizado. Rol: ${authenticatedUser ? authenticatedUser.role : 'N/A'}. User ID simulado: ${simulatedUserId}.`);
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Profesor.' });
    }
}

// --- Rutas API para Profesores ---


// GET /api/teacher/my-courses - Obtener los cursos asignados al profesor logueado
router.get('/my-courses', isTeacher, (req, res) => {
    const teacherUserId = req.user.id;
    console.log(`Solicitud GET /api/teacher/my-courses recibida para Teacher ID: ${teacherUserId}`);

    try {
        const assignedCourseIds = teacherCourseAssignments
            .filter(assignment => assignment.teacherId === teacherUserId)
            .map(assignment => assignment.courseId);

        const teacherCourses = courses.filter(course => assignedCourseIds.includes(course.id));

        res.status(200).json(teacherCourses);
    } catch (error) {
        console.error('Error en la ruta /api/teacher/my-courses:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener cursos del profesor.' });
    }
});

// GET /api/teacher/course/:courseId/students - Obtener los estudiantes inscritos en un curso específico
router.get('/course/:courseId/students', isTeacher, (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const teacherUserId = req.user.id;

    try {
      const isAssignedToTeacher = teacherCourseAssignments.some(assignment =>
          assignment.teacherId === teacherUserId && assignment.courseId === courseId
      );

      if (!isAssignedToTeacher) {
          return res.status(403).json({ message: 'Acceso denegado. No impartes este curso.' });
      }

      const courseEnrollments = enrollments.filter(e => e.courseId === courseId);

      const studentsInCourse = courseEnrollments.map(enrollment => {
          const student = students.find(s => s.id === enrollment.studentId);
          if (!student) return null; // En caso de que el estudiante no se encuentre

          // Obtener la calificación existente para este estudiante en este curso
          const existingGrade = grades.find(g => g.studentId === student.id && g.courseId === courseId);

          return {
              id: student.id,
              name: student.name,
              email: student.email,
              grade: student.grade,
              currentScore: existingGrade ? existingGrade.score : '', // Enviar la calificación actual
              currentStatus: existingGrade ? existingGrade.status : 'Inscrito' // Enviar el estado actual
          };
      }).filter(Boolean);

      res.status(200).json(studentsInCourse);
  } catch (error) {
      console.error('Error en la ruta /api/teacher/course/:courseId/students:', error);
      res.status(500).json({ message: 'Error interno del servidor al obtener estudiantes del curso.' });
  }
});

// --- NUEVA RUTA: PUT /api/teacher/grades - Para actualizar calificaciones ---
router.put('/grades', isTeacher, (req, res) => {
  const teacherUserId = req.user.id;
  const { courseId, studentId, score, status } = req.body;

  console.log(`Solicitud PUT /api/teacher/grades recibida para Profesor ID: ${teacherUserId}`);
  console.log(`Datos recibidos: Curso ${courseId}, Estudiante ${studentId}, Calificación ${score}, Estado ${status}`);

  // Validaciones básicas
  if (typeof courseId !== 'number' || typeof studentId !== 'number' || score === undefined || status === undefined) {
      return res.status(400).json({ message: 'Datos de calificación incompletos o inválidos.' });
  }

  try {
      // 1. Verificar que el profesor imparte este curso
      const isAssignedToTeacher = teacherCourseAssignments.some(assignment =>
          assignment.teacherId === teacherUserId && assignment.courseId === courseId
      );
      if (!isAssignedToTeacher) {
          return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para calificar en este curso.' });
      }

      // 2. Verificar que el estudiante esté inscrito en el curso
      const isStudentEnrolled = enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
      if (!isStudentEnrolled) {
          return res.status(404).json({ message: 'El estudiante no está inscrito en este curso.' });
      }

      // 3. Buscar y actualizar la calificación existente, o crear una nueva
      const existingGradeIndex = grades.findIndex(g => g.studentId === studentId && g.courseId === courseId);

      if (existingGradeIndex !== -1) {
          // Actualizar calificación existente
          grades[existingGradeIndex].score = score;
          grades[existingGradeIndex].status = status;
          console.log('Calificación actualizada:', grades[existingGradeIndex]);
      } else {
          // Crear nueva calificación si no existe
          const newGrade = { studentId, courseId, score, status };
          grades.push(newGrade);
          console.log('Nueva calificación agregada:', newGrade);
      }

      res.status(200).json({ message: 'Calificación actualizada con éxito.', grade: { studentId, courseId, score, status } });

  } catch (error) {
      console.error('Error en la ruta PUT /api/teacher/grades:', error);
      res.status(500).json({ message: 'Error interno del servidor al actualizar la calificación.' });
  }
});

// --- NUEVAS RUTAS PARA ASISTENCIA ---

// GET /api/teacher/course/:courseId/attendance/:date - Obtener la asistencia de un curso para una fecha específica
router.get('/course/:courseId/attendance/:date', isTeacher, (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const date = req.params.date; // Formato YYYY-MM-DD
    const teacherUserId = req.user.id;

    try {
        // Verificar que el profesor imparte este curso
        const isAssignedToTeacher = teacherCourseAssignments.some(assignment =>
            assignment.teacherId === teacherUserId && assignment.courseId === courseId
        );
        if (!isAssignedToTeacher) {
            return res.status(403).json({ message: 'Acceso denegado. No impartes este curso.' });
        }

        // Obtener los estudiantes inscritos en el curso (similar a la ruta /students)
        const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
        const studentsInCourse = courseEnrollments.map(enrollment => {
            const student = students.find(s => s.id === enrollment.studentId);
            if (!student) return null;

            // Buscar el registro de asistencia para este estudiante en esta fecha
            const existingAttendance = attendanceRecords.find(
                a => a.studentId === student.id && a.courseId === courseId && a.date === date
            );

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                grade: student.grade,
                attendanceStatus: existingAttendance ? existingAttendance.status : 'Ausente' // Default a 'Ausente' si no hay registro
            };
        }).filter(Boolean);

        res.status(200).json(studentsInCourse);

    } catch (error) {
        console.error('Error en la ruta GET /api/teacher/course/:courseId/attendance/:date:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la asistencia.' });
    }
});

// PUT /api/teacher/attendance - Actualizar/Guardar registros de asistencia
router.put('/attendance', isTeacher, (req, res) => {
    const teacherUserId = req.user.id;
    const { courseId, date, attendanceUpdates } = req.body; // attendanceUpdates es un array de { studentId, status }

    console.log(`Solicitud PUT /api/teacher/attendance recibida para Profesor ID: ${teacherUserId}`);
    console.log(`Datos recibidos: Curso ${courseId}, Fecha ${date}, Updates:`, attendanceUpdates);

    if (typeof courseId !== 'number' || typeof date !== 'string' || !Array.isArray(attendanceUpdates)) {
        return res.status(400).json({ message: 'Datos de asistencia incompletos o inválidos.' });
    }

    try {
        // Verificar que el profesor imparte este curso
        const isAssignedToTeacher = teacherCourseAssignments.some(assignment =>
            assignment.teacherId === teacherUserId && assignment.courseId === courseId
        );
        if (!isAssignedToTeacher) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para registrar asistencia en este curso.' });
        }

        let updatedCount = 0;
        let addedCount = 0;

        attendanceUpdates.forEach(update => {
            const { studentId, status } = update;
            if (typeof studentId !== 'number' || typeof status !== 'string') {
                console.warn(`Registro de asistencia inválido omitido: ${JSON.stringify(update)}`);
                return;
            }

            // Verificar que el estudiante esté inscrito en el curso
            const isStudentEnrolled = enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
            if (!isStudentEnrolled) {
                console.warn(`Estudiante ${studentId} no inscrito en el curso ${courseId}. Asistencia no registrada.`);
                return;
            }

            const existingRecordIndex = attendanceRecords.findIndex(
                a => a.studentId === studentId && a.courseId === courseId && a.date === date
            );

            if (existingRecordIndex !== -1) {
                // Actualizar registro existente
                attendanceRecords[existingRecordIndex].status = status;
                updatedCount++;
            } else {
                // Crear nuevo registro
                const newRecord = { courseId, studentId, date, status };
                attendanceRecords.push(newRecord);
                addedCount++;
            }
        });

        res.status(200).json({ message: 'Asistencia actualizada con éxito.', updated: updatedCount, added: addedCount });

    } catch (error) {
        console.error('Error en la ruta PUT /api/teacher/attendance:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la asistencia.' });
    }
});



// --- NUEVA RUTA: POST /api/teacher/send-notification - Para enviar una notificación a un padre ---
router.post('/send-notification', isTeacher, (req, res) => {
    const senderId = req.user.id; // El profesor que envía la notificación
    const { studentId, title, message } = req.body;

    console.log(`Solicitud POST /api/teacher/send-notification recibida de Profesor ID: ${senderId}`);
    console.log(`Datos: Estudiante ${studentId}, Título "${title}", Mensaje "${message}"`);

    if (typeof studentId !== 'number' || typeof title !== 'string' || typeof message !== 'string' || !title || !message) {
        return res.status(400).json({ message: 'Datos de notificación incompletos o inválidos.' });
    }

    try {
        // 1. Encontrar al estudiante y su padre
        const student = students.find(s => s.id === studentId);
        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }
        if (!student.parentId) {
            return res.status(404).json({ message: 'El estudiante no tiene un padre asignado en el sistema.' });
        }

        const parentUser = users.find(u => u.id === student.parentId && u.role === 'Parent');
        if (!parentUser) {
            return res.status(404).json({ message: 'Usuario padre asociado no encontrado o no tiene el rol correcto.' });
        }

        // 2. Crear la nueva notificación
        const newNotification = {
            id: nextNotificationId++,
            senderId: senderId,
            recipientId: parentUser.id,
            studentId: studentId,
            title: title,
            message: message,
            date: new Date().toISOString(), // Fecha y hora actual en formato ISO
            read: false
        };

        notifications.push(newNotification);
        console.log('Notificación enviada:', newNotification);

        res.status(201).json({ message: 'Notificación enviada con éxito.', notification: newNotification });

    } catch (error) {
        console.error('Error en la ruta POST /api/teacher/send-notification:', error);
        res.status(500).json({ message: 'Error interno del servidor al enviar la notificación.' });
    }
});
// NUEVA RUTA: GET /api/teacher/my-assigned-courses
// Permite a un profesor ver solo los cursos que le han sido asignados
router.get('/my-assigned-courses', isTeacher, (req, res) => {
    const teacherId = req.user.id; // Obtenemos el ID del profesor autenticado

    try {
        // 1. Encontrar las asignaciones de cursos para este profesor
        const assignedCourseIds = courseAssignments
            .filter(assignment => assignment.teacherId === teacherId)
            .map(assignment => assignment.courseId);

        // 2. Obtener los detalles completos de esos cursos
        const teacherCourses = courses.filter(course =>
            assignedCourseIds.includes(course.id)
        ).map(course => {
            // Para cada curso, encontrar los estudiantes inscritos
            const enrolledStudents = enrollments
                .filter(enroll => enroll.courseId === course.id)
                .map(enroll => {
                    const student = students.find(s => s.id === enroll.studentId);
                    // Y para cada estudiante, encontrar su calificación en este curso
                    const studentGrade = grades.find(g => g.studentId === student.id && g.courseId === course.id);

                    return {
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        grade: student.grade,
                        score: studentGrade ? studentGrade.score : 'N/A', // Calificación
                        status: studentGrade ? studentGrade.status : 'No calificado' // Estado de la calificación
                    };
                });

            return {
                id: course.id,
                name: course.name,
                code: course.code,
                credits: course.credits,
                students: enrolledStudents // Incluir los estudiantes con sus notas
            };
        });

        res.status(200).json(teacherCourses);

    } catch (error) {
        console.error('Error al obtener los cursos asignados al profesor:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener cursos asignados.' });
    }
});



module.exports = router;
