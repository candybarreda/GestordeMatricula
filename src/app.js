require('dotenv').config();
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth'); // Importa las rutas de autenticación
const adminRoutes = require('./routes/admin'); // Importa las nuevas rutas de administrador
const parentRoutes = require('./routes/parent'); 
const studentRoutes = require('./routes/student'); // ¡Importa las nuevas rutas!
const teacherRoutes = require('./routes/teacher'); // ¡Importa las nuevas rutas!
const messagesRouter = require('./routes/messages'); // Añade esta línea


const app = express();
const PORT = process.env.PORT || 3000;

const { connectDb } = require('./db'); 
// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/auth', authRoutes); // Usa las rutas de autenticación bajo /api/auth
app.use('/api/admin', adminRoutes); // Usa las rutas de administrador bajo /api/admin
app.use('/api/parent', parentRoutes); // ¡Usa las nuevas rutas de padre!
app.use('/api/student', studentRoutes); // ¡Usa las nuevas rutas de estudiante!
app.use('/api/teacher', teacherRoutes); // ¡Usa las nuevas rutas de profesor!
app.use('/api/messages', messagesRouter); // Añade esta línea


// --- RUTAS DE ARCHIVOS HTML (DEBEN IR DESPUÉS DE LAS RUTAS DE LA API) ---
// ... (Tus rutas existentes para index.html, login.html, dashboard.html, etc.) ...
// --- RUTAS DE ARCHIVOS HTML ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});
app.get('/admin/students.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'students.html'));
});
app.get('/admin/courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'courses.html'));
});
app.get('/admin/enrollments.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'enrollments.html'));
});
app.get('/admin/users.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'users.html'));
});
app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'profile.html'));
});
app.get('/parent/student_courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'parent', 'student_courses.html'));
});
app.get('/student/my_courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'student', 'my_courses.html'));
});
app.get('/teacher/my_courses.html', (req, res) => { // <--- ¡ASEGÚRATE DE ESTA LÍNEA!
    res.sendFile(path.join(__dirname, '..', 'frontend', 'teacher', 'my_courses.html'));
});
// NUEVA RUTA: Para la página de notificaciones del padre
app.get('/parent/my_notifications.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'parent', 'my_notifications.html'));
});
app.get('/message/inbox.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'message', 'inbox.html'));
});
// NUEVA RUTA: Para la página de asignación de cursos del administrador
app.get('/admin/assign_courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'assign_courses.html'));
});


// ... (Si tuvieras una ruta catch-all para 404, debería ir al final) ...
/*

app.get('/api/student/my-courses', (req, res) => {
    return res.json({
        status: 'ok'
    })
})*/
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, async () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    await connectDb(); // Conectar a la BD al iniciar el servidor
});

// Ruta para la página de inicio
// --- RUTAS DE ARCHIVOS HTML (DEBEN IR DESPUÉS DE LAS RUTAS DE LA API) ---

// Si tuvieras una ruta catch-all (por ejemplo, para 404), debería ir al final de todo
// app.get('*', (req, res) => {
//     res.status(404).sendFile(path.join(__dirname, '..', 'frontend', '404.html'));
// });


// Iniciar el servidor
/*app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detenerlo');
});*/
