// src/routes/student.js
const express = require('express');
const router = express.Router();
const { connectDb, executeProcedure } = require('../db');
// --- Copias de las bases de datos simuladas de users, students, courses, enrollments ---
// Como estamos en un prototipo, las duplicamos aquí para que el módulo sea autocontenido.
// En una aplicación real, todos accederían a una base de datos centralizada y persistente.
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

// --- NUEVO: Simulación de Calificaciones ---
// La estructura de esto sería { enrollmentId: N, score: X, status: 'Completed' | 'In Progress' }
// O directamente { studentId: N, courseId: M, score: X }
// Para simplicidad, lo haremos directo: studentId-courseId
let grades = [
    { studentId: 1, courseId: 101, score: 85, status: 'Completado' },
    { studentId: 1, courseId: 102, score: 92, status: 'Completado' },
    { studentId: 2, courseId: 101, score: 78, status: 'Completado' },
    { studentId: 4, courseId: 101, score: 90, status: 'Completado' },
    { studentId: 4, courseId: 103, score: 'En progreso', status: 'En Curso' }, // Ejemplo de curso en progreso
    { studentId: 4, courseId: 104, score: 95, status: 'Completado' },
];


// Middleware para verificar autenticación y rol de 'Student'
function isStudent(req, res, next) {
    console.log('Verificando si el usuario es Student (simulado)...');
    // En una aplicación real, aquí decodificarías un JWT del header 'Authorization'
    // y verificarías el 'id' y el 'role' real del usuario.

    // --- SIMULACIÓN DE USUARIO LOGUEADO Y SU ROL ---
    // Asumimos que el usuario logueado para estas rutas es 'student_user' (ID 4).
    const simulatedUserId = 4; // ID del usuario con rol 'Student'
    console.log(`--- isAuthenticated: Simulando usuario con ID: ${simulatedUserId} ---`);
    const authenticatedUser = users.find(u => u.id === simulatedUserId);

    if (authenticatedUser && authenticatedUser.role === 'Student') {
        req.user = authenticatedUser; // Adjunta el objeto de usuario completo
        console.log(`Usuario ${req.user.username} (ID: ${req.user.id}) autenticado como Student.`);
        next();
    } else {
        console.warn(`Intento de acceso no autorizado. Rol: ${authenticatedUser ? authenticatedUser.role : 'N/A'}`);
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Estudiante.' });
    }
}

// --- Rutas API para Estudiantes ---
// GET /api/student/my-courses - Obtener los cursos y calificaciones del estudiante logueado
router.get('/my-courses', isStudent, (req, res) => { // <--- Asegúrate de que la ruta sea '/my-courses' aquí
    // ... (tu lógica para obtener cursos y calificaciones) ...
    try {
        const studentUserId = req.user.id;
        const studentInfo = students.find(s => s.id === studentUserId);
        
        if (!studentInfo) {
            return res.status(404).json({ message: 'Información de estudiante no encontrada para este usuario.' });
        }

        const studentEnrollments = enrollments.filter(e => e.studentId === studentUserId);

        const coursesWithGrades = studentEnrollments.map(enrollment => {
            const course = courses.find(c => c.id === enrollment.courseId);
            const grade = grades.find(g => g.studentId === studentUserId && g.courseId === course.id);

            return {
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                credits: course.credits,
                score: grade ? grade.score : 'N/A',
                status: grade ? grade.status : 'Inscrito',
            };
        }).filter(Boolean);

        res.status(200).json(coursesWithGrades);
    } catch (error) {
        console.error('Error en la ruta /api/student/my-courses:', error);
        res.status(500).json({ message: 'Error interno del servidor al cargar cursos.' });
    }
});


/*

// GET /api/student/my-courses - Obtener los cursos y calificaciones del estudiante logueado
router.get('/my-courses', isStudent, (req, res) => {
    const studentUserId = req.user.id; // El ID del usuario que ha iniciado sesión
    console.log(`Solicitud GET /api/student/my-courses recibida para Estudiante ID (user): ${studentUserId}`);

    // En nuestra simulación, el ID del 'user' y el ID del 'student' son los mismos
    const studentInfo = students.find(s => s.id === studentUserId);

    if (!studentInfo) {
        return res.status(404).json({ message: 'Información de estudiante no encontrada para este usuario.' });
    }

    // Encontrar todas las inscripciones para este estudiante
    const studentEnrollments = enrollments.filter(e => e.studentId === studentUserId);

    // Mapear las inscripciones a información de curso y calificación
    const coursesWithGrades = studentEnrollments.map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        const grade = grades.find(g => g.studentId === studentUserId && g.courseId === course.id);

        return {
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            credits: course.credits,
            score: grade ? grade.score : 'N/A', // Si no hay calificación, N/A
            status: grade ? grade.status : 'Inscrito', // Si no hay calificación, estado 'Inscrito'
        };
    }).filter(Boolean); // Eliminar posibles nulos si un curso no se encuentra

    res.status(200).json(coursesWithGrades);
});*/


module.exports = router;