// src/routes/messages.js
const express = require('express');
const router = express.Router();
const { connectDb, executeProcedure, executeQuery } = require('../db');

// --- COPIA DE LAS BASES DE DATOS SIMULADAS (ASEGÚRATE QUE ESTAS SEAN CONSISTENTES
// CON TUS OTROS ARCHIVOS DE RUTAS COMO parent.js, teacher.js, admin.js) ---
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
    { id: 1, studentId: 1, courseId: 101 },
    { id: 2, studentId: 1, courseId: 102 },
    { id: 3, studentId: 2, courseId: 101 },
    { id: 4, studentId: 4, courseId: 101 },
    { id: 5, studentId: 4, courseId: 103 },
    { id: 6, studentId: 4, courseId: 104 },
];

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

let notifications = [
    { id: 1, senderId: 3, recipientId: 2, studentId: 4, title: 'Calificación de Matemáticas I', message: 'Carlos obtuvo 90 en el último examen de Matemáticas.', date: '2025-06-17T10:00:00Z', read: false },
    { id: 2, senderId: 3, recipientId: 2, studentId: 2, title: 'Asistencia de Lenguaje', message: 'Luis estuvo ausente en la clase de Lenguaje del 16/06.', date: '2025-06-17T10:05:00Z', read: false },
    { id: 3, senderId: 1, recipientId: 2, studentId: null, title: 'Recordatorio General', message: 'Mañana no habrá clases por feriado.', date: '2025-06-16T15:00:00Z', read: true },
];

let messages = [
    { id: 1, senderId: 3, recipientId: 2, studentId: 4, subject: 'Progreso de Carlos en Matemáticas', content: 'Carlos ha mostrado una gran mejora en las últimas semanas en Matemáticas. ¡Felicidades!', date: '2025-06-18T10:00:00Z', read: false },
    { id: 2, senderId: 2, recipientId: 3, studentId: 4, subject: 'Re: Progreso de Carlos en Matemáticas', content: 'Muchas gracias, Profesor! Nos alegra mucho escucharlo. Estamos trabajando con él en casa.', date: '2025-06-18T10:30:00Z', read: false },
    { id: 3, senderId: 1, recipientId: 3, studentId: null, subject: 'Reunión de Profesores', content: 'Recordatorio: Reunión de profesores el viernes a las 3 PM en la sala de juntas.', date: '2025-06-18T09:00:00Z', read: true },
    { id: 4, senderId: 3, recipientId: 4, studentId: null, subject: 'Tarea de Lenguaje', content: 'Sofía, recuerda entregar la tarea de Lenguaje para mañana.', date: '2025-06-18T11:00:00Z', read: false }
];
let courseAssignments = [
    { courseId: 101, teacherId: 3 }, // Matemáticas I asignada al Teacher (ID 3)
    { courseId: 102, teacherId: 3 }, // Lenguaje y Comunicación asignada al Teacher (ID 3)
    { courseId: 103, teacherId: 3 }  // Historia del Perú asignada al Teacher (ID 3)
];

// Middleware de autenticación genérico (simulado)
// Este middleware simula la autenticación y asigna un usuario a req.user.
// En un sistema real, esto se manejaría con tokens JWT y bases de datos reales.
async function isAuthenticated(req, res, next) {
    // En una aplicación real, aquí se verificaría un token JWT o una sesión.
    // Por ahora, simulamos que el usuario "parent_user" (ID 2) está siempre logueado para pruebas.
    // Puedes cambiar el ID para simular otros usuarios si lo necesitas para pruebas.
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : 2; // Default to parent_user for general testing

    const [authenticatedUser] = await executeQuery(`
            SELECT Id as id, PasswordHash as password, Username as username, Role as role, FechaRegistro as created_at FROM dbo.Usuarios
            WHERE Id = @id
        `, {
            id: userId
        })

    if (authenticatedUser) {
        req.user = authenticatedUser; // Adjunta el usuario autenticado a la solicitud
        console.log(`Usuario ${req.user.username} (ID: ${req.user.id}, Rol: ${req.user.role}) autenticado.`);
        next();
    } else {
        console.warn(`Intento de acceso no autorizado. User ID simulado: ${userId}.`);
        return res.status(401).json({ message: 'No autenticado. Por favor, inicie sesión.' });
    }
}


// GET /api/messages/inbox - Obtener mensajes recibidos por el usuario actual
router.get('/inbox', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    try {
        const userMessages = messages.filter(m => m.recipientId === userId)
                                    .map(m => {
                                        const sender = users.find(u => u.id === m.senderId);
                                        const student = m.studentId ? students.find(s => s.id === m.studentId) : null;
                                        return {
                                            ...m,
                                            senderName: sender ? sender.username : 'Usuario Desconocido',
                                            studentName: student ? student.name : 'N/A'
                                        };
                                    });
        res.status(200).json(userMessages);
    } catch (error) {
        console.error('Error al obtener mensajes de la bandeja de entrada:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener mensajes.' });
    }
});

// GET /api/messages/sent - Obtener mensajes enviados por el usuario actual
router.get('/sent', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    try {
        const sentMessages = messages.filter(m => m.senderId === userId)
                                    .map(m => {
                                        const recipient = users.find(u => u.id === m.recipientId);
                                        const student = m.studentId ? students.find(s => s.id === m.studentId) : null;
                                        return {
                                            ...m,
                                            recipientName: recipient ? recipient.username : 'Usuario Desconocido',
                                            studentName: student ? student.name : 'N/A'
                                        };
                                    });
        res.status(200).json(sentMessages);
    } catch (error) {
        console.error('Error al obtener mensajes enviados:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener mensajes enviados.' });
    }
});

// POST /api/messages/send - Enviar un nuevo mensaje
router.post('/send', isAuthenticated, (req, res) => {
    const { recipientId, studentId, subject, content } = req.body;
    const senderId = req.user.id; // El remitente es el usuario autenticado

    if (!recipientId || !subject || !content) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: recipientId, subject, content.' });
    }

    const recipientUser = users.find(u => u.id === recipientId);
    if (!recipientUser) {
        return res.status(404).json({ message: 'Destinatario no encontrado.' });
    }

    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        senderId,
        recipientId,
        studentId: studentId || null, // Opcional, para mensajes sobre un estudiante específico
        subject,
        content,
        date: new Date().toISOString(),
        read: false
    };

    messages.push(newMessage);
    console.log(`Nuevo mensaje enviado por ${req.user.username} a ${recipientUser.username}:`, newMessage);
    res.status(201).json({ message: 'Mensaje enviado con éxito', messageId: newMessage.id });
});

// PUT /api/messages/:id/read - Marcar un mensaje como leído
router.put('/:id/read', isAuthenticated, (req, res) => {
    const messageId = parseInt(req.params.id);
    const userId = req.user.id; // El usuario autenticado

    const message = messages.find(m => m.id === messageId && m.recipientId === userId);

    if (!message) {
        return res.status(404).json({ message: 'Mensaje no encontrado o no autorizado.' });
    }

    if (message.read) {
        return res.status(200).json({ message: 'Mensaje ya marcado como leído.' });
    }

    message.read = true;
    res.status(200).json({ message: 'Mensaje marcado como leído.' });
});

// GET /api/messages/recipients - Obtener lista de posibles destinatarios (para el frontend)
// Excluye al propio usuario autenticado
router.get('/recipients', isAuthenticated, (req, res) => {
    const currentUserId = req.user.id;
    const availableRecipients = users.filter(u => u.id !== currentUserId)
                                    .map(u => ({ id: u.id, username: u.username, role: u.role }));
    res.status(200).json(availableRecipients);
});

module.exports = router;