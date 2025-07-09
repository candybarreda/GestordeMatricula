// src/data.js

let users = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
  { id: 2, username: 'parent_user', email: 'parent@example.com', password: 'password123', role: 'Parent' },
  { id: 3, username: 'teacher_user', email: 'teacher@example.com', password: 'password123', role: 'Teacher' },
  { id: 4, username: 'student_user', email: 'student@example.com', password: 'password123', role: 'Student' },
  { id: 5, username: 'another_student', email: 'another@example.com', password: 'password123', role: 'Student' }
];

let students = [
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
      studentUserId: null,
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
  { id: 101, name: 'Matemáticas I', code: 'MAT101', teacherId: 3 },
  { id: 102, name: 'Literatura', code: 'LIT102', teacherId: 3 },
  { id: 103, name: 'Ciencias Naturales', code: 'CIE103', teacherId: null }
];

let enrollments = [
  { studentId: 1, courseId: 101, enrollmentDate: '2023-09-01' },
  { studentId: 1, courseId: 102, enrollmentDate: '2023-09-01' },
  { studentId: 2, courseId: 101, enrollmentDate: '2023-09-01' },
  { studentId: 4, courseId: 101, enrollmentDate: '2023-09-01' },
  { studentId: 4, courseId: 102, enrollmentDate: '2023-09-01' },
  { studentId: 4, courseId: 103, enrollmentDate: '2023-09-01' }
];

let grades = [
  { id: 1, studentId: 1, courseId: 101, score: 85, date: '2023-11-15' },
  { id: 2, studentId: 1, courseId: 102, score: 92, date: '2023-11-10' },
  { id: 3, studentId: 2, courseId: 101, score: 78, date: '2023-11-20' }
];

let attendanceRecords = [
  { studentId: 1, courseId: 101, date: '2023-10-01', status: 'Presente' },
  { studentId: 1, courseId: 101, date: '2023-10-02', status: 'Ausente' },
  { studentId: 2, courseId: 101, date: '2023-10-01', status: 'Presente' }
];

let notifications = [
  { id: 1, userId: 2, message: 'Nueva calificación disponible para Matemáticas I de Ana García.', date: '2023-12-01T10:00:00Z', read: false },
  { id: 2, userId: 2, message: 'Su hijo Luis Pérez estuvo ausente en clase de Matemáticas I el 2023-10-02.', date: '2023-10-02T15:30:00Z', read: true }
];

let messages = [
  { id: 1, fromUserId: 2, toUserId: 3, subject: 'Consulta sobre Ana', body: '¿Podría darme una actualización sobre el progreso de Ana en clase?', date: '2023-12-05T09:00:00Z', read: false },
  { id: 2, fromUserId: 3, toUserId: 2, subject: 'Re: Consulta sobre Ana', body: 'Claro, Ana está progresando bien, aunque necesita reforzar la multiplicación.', date: '2023-12-05T10:00:00Z', read: true }
];

let courseAssignments = [
  { teacherId: 3, courseId: 101 },
  { teacherId: 3, courseId: 102 }
];

module.exports = {
  users,
  students,
  courses,
  enrollments,
  grades,
  attendanceRecords,
  notifications,
  messages,
  courseAssignments
};