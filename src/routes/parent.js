// src/routes/parent.js

const express = require('express'); // Primero declara y asigna 'express'
const router = express.Router();    // Luego usa 'express' para crear el router
const jwt = require('jsonwebtoken'); // Luego otras importaciones

const { connectDb, executeProcedure, sql, executeQuery } = require('../db'); // Importa la conexión SQL
// --- Importar o copiar las bases de datos simuladas de users, students, courses, enrollments ---
// Para este prototipo, vamos a copiarlas aquí para que este módulo sea autocontenido.
// En una aplicación real, todos accederían a una base de datos central.

let users = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { id: 2, username: 'parent_user', email: 'parent@example.com', password: 'password123', role: 'Parent' },
    { id: 3, username: 'teacher_user', email: 'teacher@example.com', password: 'password123', role: 'Teacher' },
    { id: 4, username: 'student_user', email: 'student@example.com', password: 'password123', role: 'Student' }, // Este es el UsuarioID para Ana García
    { id: 5, username: 'another_student', email: 'another@example.com', password: 'password123', role: 'Student' } // Y así, otros IDs para futuros estudiantes
];

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
    { id: 1, studentId: 1, courseId: 101 },
    { id: 2, studentId: 1, courseId: 102 },
    { id: 3, studentId: 2, courseId: 101 },
    { id: 4, studentId: 4, courseId: 101 },
    { id: 5, studentId: 4, courseId: 103 },
    { id: 6, studentId: 4, courseId: 104 },
];
// --- NUEVO: Simulación de asociaciones Padre-Estudiante ---
let grades = [
    { studentId: 1, courseId: 101, score: 85, status: 'Completado' },
    { studentId: 1, courseId: 102, score: 92, status: 'Completado' },
    { studentId: 2, courseId: 101, score: 78, status: 'Completado' },
    { studentId: 4, courseId: 101, score: 90, status: 'Completado' },
    { studentId: 4, courseId: 103, score: 'En progreso', status: 'En Curso' },
    { studentId: 4, courseId: 104, score: 95, status: 'Completado' },
];
let attendanceRecords = [
    { courseId: 101, studentId: 1, date: '2025-06-16', status: 'Presente' },
    { courseId: 101, studentId: 2, date: '2025-06-16', status: 'Ausente' },
    { courseId: 101, studentId: 4, date: '2025-06-16', status: 'Presente' },
    { courseId: 103, studentId: 4, date: '2025-06-16', status: 'Presente' },
];

// Para este ejemplo, asegúrate que las notificaciones en teacher.js y parent.js sean el mismo array.
let notifications = [
    { id: 1, senderId: 3, recipientId: 2, studentId: 4, title: 'Calificación de Matemáticas I', message: 'Carlos obtuvo 90 en el último examen de Matemáticas.', date: '2025-06-17T10:00:00Z', read: false },
    { id: 2, senderId: 3, recipientId: 2, studentId: 2, title: 'Asistencia de Lenguaje', message: 'Luis estuvo ausente en la clase de Lenguaje del 16/06.', date: '2025-06-17T10:05:00Z', read: false },
    { id: 3, senderId: 1, recipientId: 2, studentId: null, title: 'Recordatorio General', message: 'Mañana no habrá clases por feriado.', date: '2025-06-16T15:00:00Z', read: true },
];

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


// Middleware para verificar autenticación y rol de 'Parent'
async function isParent(req, res, next) {
    console.log('Verificando si el usuario es Parent (simulado)...');
    // En una aplicación real, aquí decodificarías un JWT del header 'Authorization'
    // y verificarías el 'id' y el 'role' real del usuario.

    // --- SIMULACIÓN DE USUARIO LOGUEADO Y SU ROL ---
    // Asumimos que el usuario logueado para estas rutas es 'parent_user' (ID 2).
    // ¡En un sistema real, esto provendría de la sesión/token del usuario!
    const userId = req.headers['x-user-id'] || req.headers['X-User-Id']; // ID del usuario con rol 'Parent'
    const [authenticatedUser] = await executeQuery(`
            SELECT Id as id, PasswordHash as password, Username as username, Role as role, FechaRegistro as created_at FROM dbo.Usuarios
            WHERE Id = @id
        `, {
            id: userId
        })

    if (authenticatedUser && ['Padre', 'Madre', 'Tutor'].includes(authenticatedUser.role)) {
        req.user = authenticatedUser; // Adjunta el objeto de usuario completo
        console.log(`Usuario ${req.user.username} (ID: ${req.user.id}) autenticado como Parent.`);
        next();
    } else {
        console.warn(`Intento de acceso no autorizado. Rol: ${authenticatedUser ? authenticatedUser.role : 'N/A'}`);
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Padre/Tutor.' });
    }
}

// --- Rutas API para Padres/Tutores ---

// GET /api/parent/students - Obtener los estudiantes asociados al padre/tutor logueado
router.get('/students', isParent, (req, res) => {
    console.log(`Solicitud GET /api/parent/students recibida para Parent ID: ${req.user.id}`);
    const parentId = req.user.id; // Obtenemos el ID del padre del objeto req.user

    const associatedStudentIds = parentStudentAssociations
        .filter(assoc => assoc.parentId === parentId)
        .map(assoc => assoc.studentId);

    const parentStudents = students.filter(student => associatedStudentIds.includes(student.id));

    res.status(200).json(parentStudents);
});

// GET /api/parent/student/:studentId/courses - Obtener los cursos de un estudiante específico
router.get('/student/:studentId/courses', isParent, (req, res) => {
    const studentId = parseInt(req.params.studentId);
    const parentId = req.user.id; // El ID del padre/tutor logueado

    console.log(`Solicitud GET /api/parent/student/${studentId}/courses para Parent ID: ${parentId}`);

    // Primero, verificar que este estudiante realmente pertenezca a este padre/tutor
    const isAssociated = parentStudentAssociations.some(assoc =>
        assoc.parentId === parentId && assoc.studentId === studentId
    );

    if (!isAssociated) {
        return res.status(403).json({ message: 'Acceso denegado. Este estudiante no está asociado a tu cuenta.' });
    }

    // Buscar las inscripciones del estudiante
    const studentEnrollments = enrollments.filter(e => e.studentId === studentId);

    // Obtener los detalles de los cursos para esas inscripciones
    const coursesForStudent = studentEnrollments.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return course ? {
            id: course.id,
            name: course.name,
            code: course.code,
            credits: course.credits
        } : null; // En caso de que un curso no se encuentre (lo cual no debería pasar)
    }).filter(Boolean); // Eliminar posibles nulos

    res.status(200).json(coursesForStudent);
});

// GET /api/parent/my-students - Obtener los estudiantes asociados al padre logueado
/*router.get('/my-students', isParent, (req, res) => {
    const parentUserId = req.user.id;
    try {
        const parentStudents = students.filter(student => student.parentId === parentUserId);

        const studentsWithCoursesAndGrades = parentStudents.map(student => {
            const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
            const studentCourses = studentEnrollments.map(e => {
                const course = courses.find(c => c.id === e.courseId);
                const grade = grades.find(g => g.studentId === student.id && g.courseId === e.courseId);
                return course ? {
                    id: course.id,
                    name: course.name,
                    code: course.code,
                    credits: course.credits,
                    score: grade ? grade.score : 'N/A',
                    status: grade ? grade.status : 'Inscrito'
                } : null;
            }).filter(Boolean); // Eliminar cualquier curso que no se encuentre

            return {
                id: student.id,
                name: student.name,
                email: student.email,
                grade: student.grade,
                courses: studentCourses
            };
        });
        res.status(200).json(studentsWithCoursesAndGrades);
    } catch (error) {
        console.error('Error en la ruta /api/parent/my-students:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los estudiantes del padre.' });
    }
});*/

// --- NUEVA RUTA: GET /api/parent/my-notifications - Obtener notificaciones para el padre logueado ---
router.get('/my-notifications', isParent, async (req, res) => {
    const parentUserId = req.user.id;
    console.log(`Solicitud GET /api/parent/my-notifications recibida para Padre ID: ${parentUserId}`);

    try {
        const parentNotifications = await executeQuery(`
            SELECT * FROM dbo.Notificaciones
            WHERE UsuarioId = @id
        `, {
            id: parentUserId
        })

        res.status(200).json(parentNotifications);
    } catch (error) {
        console.error('Error en la ruta /api/parent/my-notifications:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener notificaciones.' });
    }
});

// --- NUEVA RUTA: PUT /api/parent/notifications/:id/read - Marcar notificación como leída ---
router.put('/notifications/:id/read', isParent, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const parentUserId = req.user.id;

    console.log(`Solicitud PUT /api/parent/notifications/${notificationId}/read recibida para Padre ID: ${parentUserId}`);

    try {
        const [notification] = await executeQuery(`
            SELECT   Mensaje as message ,Leido as "read"
            FROM Notificaciones
            WHERE  NotificacionID  = @notificationId 
        `, {
            notificationId

        })

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada o no pertenece a este padre.' });
        }

        if (notification.read) {
            return res.status(200).json({ message: 'La notificación ya está marcada como leída.' });
        }

        notification.read = true;
        await executeQuery(`
            update Notificaciones
            set
                Leido = 1
            WHERE
                NotificacionID = @notificationId
        `, {
            notificationId
        })
        console.log(`Notificación ${notificationId} marcada como leída.`);
        res.status(200).json({ message: 'Notificación marcada como leída con éxito.' });

    } catch (error) {
        console.error('Error en la ruta PUT /api/parent/notifications/:id/read:', error);
        res.status(500).json({ message: 'Error interno del servidor al marcar la notificación como leída.' });
    }
});

// NUEVA RUTA: POST /api/parent/my-students - Para que un padre registre a sus hijos
// MODIFICACIÓN: POST /api/parent/my-students - Para que un padre registre a sus hijos
// RUTA POST /api/parent/my-students - Para que un padre registre a sus hijos
router.post('/my-students', isParent, async (req, res) => { // Marca como 'async'
    const parentId = req.user.id;
    const { name, lastname, email, id_grado, birthDate } = req.body;

    if (!name || !lastname || !email || !id_grado || !birthDate) {
        return res.status(400).json({ message: 'Todos los campos (nombre, email, grado, fecha de nacimiento) son obligatorios para el estudiante.' });
    }

    try {
        
        // Verificar si el email ya existe
        const result = await executeQuery('SELECT EstudianteID FROM Estudiantes WHERE Email = @email', {
            email
        });

        console.log(result)

        if (result.length > 0) {
            return res.status(409).json({ message: 'Ya existe un estudiante con este email en el sistema.' });
        }

        // studentUserId, Status, RegistrationDate, WithdrawalDate se manejan en la tabla SQL

        const insertResult = await executeQuery(`
            INSERT INTO Estudiantes (Nombres,Apellido, Email, FechaNacimiento, ParentUsuarioID, Estado, FechaRegistro, FechaRetiro, Id_Grado)
            VALUES (@name,@lastname, @email, @birthDate, @parentId, 'Activo', GETDATE(), NULL, @idGrade);
            SELECT SCOPE_IDENTITY() AS EstudianteID; -- Para obtener el ID del estudiante recién insertado
        `,
        {
            name,
            lastname,
            email,
            birthDate,
            parentId,
            idGrade: id_grado,
        });
        console.log(insertResult)
        const newStudentId = insertResult[0].EstudianteID;

        // Puedes opcionalmente obtener el estudiante completo para devolverlo
        const newStudent = {
            id: newStudentId,
            name,
            lastname,
            email,
            grade : id_grado,
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
    console.log(parentId)

    try {
        const result = await executeQuery(`
            SELECT 
                es.EstudianteID AS id, Nombres AS name, Email AS email, gr.nombre_grado AS grade, FechaNacimiento AS birthDate, ParentUsuarioID AS parentId, Estado AS status, FechaRegistro AS registrationDate, FechaRetiro AS withdrawalDate, 
                (CASE WHEN ip.InscripcionID IS NOT NULL THEN 1 ELSE 0 END) as isEnrolled,

                c.Nombre as cursoNombre, c.descripcion as descripcion, 
                

                n.Puntaje as notaPuntaje, n.TipoEvaluacion as evaluacion, n.FechaCalificacion as fechacalificacion, n.Comentarios as observacion 

            FROM Estudiantes es
            LEFT JOIN Grados gr on gr.id_grado = es.Id_Grado
            LEFT JOIN Inscripciones ip on (ip.EstudianteID = es.EstudianteID and ip.Id_Grado = es.Id_Grado )
            LEFT JOIN Grado_Curso_Asignacion gca on gca.Id_Grado = ip.Id_Grado
            LEFT JOIN Cursos c on c.CursoId = gca.CursoId
            LEFT JOIN Notas n on n.AsignacionId = gca.AsignacionID and n.EstudianteID = es.EstudianteID
            WHERE ParentUsuarioID = @parentId
        `, { parentId });

        const parentStudents = result; 

        if (parentStudents.length === 0) {
            return res.status(200).json([]);
        }
        /**
         * {'1': {id: 1, no}, '2': {}}
         */
        const obj = parentStudents.reduce((a,b) => {
            const existStudent = !!a[b.id];
            const course = { nombre: b.cursoNombre, puntaje: b.notaPuntaje, fechacal : b.fechacalificacion, tipodevaluacion : b.evaluacion, observacion : b.observacion }
            if(existStudent){
                const existCourse = a[b.id].courses.findIndex((c) => c.cursoNombre === b.cursoNombre);
                if (existCourse !== -1) {

                }
                a[b.id].courses.push(course)
            }else {
                a[b.id] = {
                    ...b
                }
                a[b.id].courses = [course]
                delete a[b.id]['cursoNombre']
                delete a[b.id]['notaPuntaje']
            }
            return a
        }, {})
        res.status(200).json(Object.values(obj));
    } catch (err) {
        console.error('Error al obtener hijos del padre:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener hijos.' });
    }
});

router.get('/grades', isParent, async (req, res) => {
   
    try {
        const result = await executeQuery('SELECT id_grado, nombre_grado, id_nivel_academico, descripcion FROM Grados');

        const parentStudents = result; // Los resultados de la consulta
        console.log(parentStudents)
        if (parentStudents.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(parentStudents);
    } catch (err) {
        console.error('Error al obtener hijos del padre:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener hijos.' });
    }


})

router.post('/students/:studentId/enroll', isParent, async (req, res) => {
    const parentId = req.user.id;
    const studentId = req.params.studentId;

    try {

        const [{ id_grado: idGrado, nombre }] = await executeQuery(`
            SELECT Id_Grado as id_grado, Nombres as nombre
            FROM Estudiantes
            WHERE EstudianteID = @id
        `, {
            id: studentId
        })

        await executeQuery(`
            INSERT INTO Inscripciones (EstudianteID, FechaInscripcion, Id_Grado, Estado_Inscripcion, Monto_Inscripcion)
            VALUES (@EstudianteID, @FechaInscripcion, @Id_Grado, @Estado_Inscripcion, @Monto_Inscripcion)
        `, {
            EstudianteID: studentId,
            FechaInscripcion: new Date(),
            Id_Grado: idGrado,
            Estado_Inscripcion: "activa",
            Monto_Inscripcion: 500
        });

        await executeQuery(`
        INSERT INTO Notificaciones (UsuarioID, Mensaje, Fecha, Leido)
        VALUES (@UsuarioID, @Mensaje, @Fecha, @Leido)
        `, {
            UsuarioID: parentId,
            Mensaje: `Matricula exitosa para estudiante ${nombre}, al grado ${idGrado} año 2025`,
            Fecha: new Date(),
            Leido: 0,
        });

        res.status(201).json({
            message: `Matricula registrada.`
        });

    } catch (err) {
        console.error('Error al registrar estudiante o inscribirlo en cursos:', err);
        res.status(500).json({ message: err.message || 'Error interno del servidor al registrar estudiante.' });
    }
});
// --- NUEVA RUTA: GET /api/parent/student-grades ---
// Permite al padre obtener las calificaciones de sus hijos
router.get('/student/:studentId/courses', isParent, async (req, res) => {
    const parentId = req.user.id; // ID del padre logueado
    const studentId = req.params.studentId;
    try {
        
        

        const result = await executeQuery(`
            SELECT
                e.EstudianteID AS studentId,
                e.Nombres AS studentName,
                c.Nombre AS courseName,
                g.nombre_grado AS gradeName,
                cal.TipoEvaluacion AS evaluationType,
                cal.Puntaje AS score,
                cal.FechaCalificacion AS scoreDate,
                cal.Comentarios AS observations
            FROM
                Estudiantes e
            JOIN
                Inscripciones i ON e.EstudianteID = i.EstudianteID
            JOIN
                Grados g ON i.Id_Grado = g.id_grado
            JOIN
                Grado_Curso_Asignacion gca ON gca.Id_Grado = g.id_grado
            JOIN
                Cursos c ON i.CursoID = c.CursoID
            LEFT JOIN -- Usamos LEFT JOIN para incluir estudiantes/cursos que aún no tienen calificaciones
                Calificaciones cal ON i.InscripcionID = cal.InscripcionID
            WHERE
                e.ParentUsuarioID = @parentId
            ORDER BY
                e.Nombres, c.Nombre, cal.FechaRegistro DESC;
        `, {
            parentId
        });

        res.status(200).json(result.recordset);

    } catch (err) {
        console.error('Error al obtener calificaciones de los hijos:', err);
        res.status(500).json({ message: 'Error interno del servidor al cargar calificaciones.' });
    }
});

// ... (tus otras rutas existentes) ...



module.exports = router;