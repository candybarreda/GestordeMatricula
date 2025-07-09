const express = require('express');
const router = express.Router();
const { connectDb, executeProcedure, executeQuery } = require('../db');

// Base de datos de usuarios simulada para el prototipo
// ¡En un entorno real, esto vendría de tu DB real y con contraseñas hasheadas!

let users = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { id: 2, username: 'parent_user', email: 'parent@example.com', password: 'password123', role: 'Parent' },
    { id: 3, username: 'teacher_user', email: 'teacher@example.com', password: 'password123', role: 'Teacher' },
    { id: 4, username: 'student_user', email: 'student@example.com', password: 'password123', role: 'Student' },
];
let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1; // Para nuevos registros


function isAuthenticated(req, res, next) {
    // --- SIMULACIÓN DE USUARIO LOGUEADO EN EL BACKEND ---
    // En una aplicación real, aquí DECODIFICARÍAS un token JWT
    // (que el frontend enviaría en los headers de la petición)
    // para obtener el ID y rol del usuario que hace la petición.
    // Para nuestro prototipo, vamos a simular que el usuario logueado
    // es el 'admin@example.com' (ID 1) para las rutas de perfil.
    // Esto solo es para que el backend tenga un "usuario actual" con quien trabajar.
    //const storedUserId = localStorage.getItem('userId'); // Si estás usando localStorage para simular sesión
    //const storedUserRole = localStorage.getItem('userRole'); // Si estás usando localStorage para simular sesión
    const simulatedUserId = 1; // Asumimos que el usuario logueado es siempre el admin para el perfil
                              // ¡En un sistema real, esto NUNCA se haría así!
                              // Se usaría el ID real del token JWT.
    //const authenticatedUser = users.find(u => u.id === parseInt(storedUserId));
    
    console.log(`--- isAuthenticated: Simulando usuario con ID: ${simulatedUserId} ---`);

    const authenticatedUser = users.find(u => u.id === simulatedUserId);

    if (authenticatedUser) {
        req.user = {
            id: authenticatedUser.id,
            username: authenticatedUser.username,
            email: authenticatedUser.email,
            role: authenticatedUser.role
        };// Adjunta la información del usuario a la petición
        console.log(`--- isAuthenticated: Usuario simulado encontrado: ${req.user.username} (${req.user.role}) ---`); // Log de éxito

        next();
    } else {
        // Esto solo debería ocurrir si el ID simulado no existe en tu array de usuarios
        console.error(`--- isAuthenticated: Error: Usuario simulado con ID ${simulatedUserId} NO ENCONTRADO. ---`); // Log de error
        return res.status(401).json({ message: 'No autorizado. (Simulación: Usuario simulado no encontrado).' });
    }
}


// Ruta para la simulación de login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [user] = await executeQuery(`
        SELECT Id as id, PasswordHash as password, Username as username, Role as role, FechaRegistro as created_at FROM dbo.Usuarios
        WHERE email = @email
    `, {
        email
    })
    console.log(user);
    if (user && user.password === password) {
        // En un sistema real, aquí generarías un JWT
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token: 'dummy-token', // Un token ficticio
            userId: user.id, // ¡Importante!
            username: user.username,
            role: user.role // ¡Importante!
        });
    } else {
        console.log(`Intento de inicio de sesión fallido para: ${email}`);
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

// NUEVA RUTA: Ruta para la simulación de registro
router.post('/register', async (req, res) => {
    const { fullName, email, password, role } = req.body;

    
    // Validación básica: verificar si el email ya existe
    const [existingUser] = await executeQuery(`
        SELECT id FROM dbo.Usuarios
        WHERE email = @email
    `, {
        email
    })

    if (existingUser) {
        console.log(`Intento de registro fallido: el email ${email} ya existe.`);
        return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    // Validación de contraseña (mínimo 6 caracteres, ya se valida en frontend, pero bueno tenerlo en backend)
    if (password.length < 6) {
        console.log(`Intento de registro fallido: contraseña muy corta para ${email}`);
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    await executeQuery(`
        INSERT INTO dbo.Usuarios(username, email, passwordHash, role)
        VALUES (@username, @email, @password, @role)
    `, {
        username: fullName,
        email,
        password,
        role,
    })

    console.log(`Nuevo usuario registrado: ${email} con rol: ${role}`);
    console.log('Usuarios actuales:', users); // Para depuración

    res.status(201).json({
        message: 'Registro exitoso. ¡Bienvenido!',
        user: { email, role }
    });
});

// --- NUEVAS RUTAS DE PERFIL ---

// Ruta para obtener el perfil del usuario logueado
router.get('/profile', isAuthenticated, (req, res) => {
    console.log('Solicitud GET /api/auth/profile recibida para usuario:', req.user?.username);
    // req.user ya contiene la información del usuario autenticado (simulado)
    // Excluir la contraseña por seguridad
    const { password, ...userProfile } = req.user || {};
    res.status(200).json(userProfile);
});

// Ruta para actualizar la información de perfil (nombre de usuario, email)
router.put('/profile', isAuthenticated, (req, res) => {
    console.log('Solicitud PUT /api/auth/profile recibida para usuario:', req.user.username);
    const { id, username, email } = req.body; // El ID se envía desde el frontend para encontrar al usuario
    
    // Verificar que el ID del cuerpo coincida con el ID del usuario autenticado para evitar que un usuario edite a otro
    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permiso para editar este perfil.' });
    }

    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!username || !email) {
        return res.status(400).json({ message: 'Nombre de usuario y correo electrónico son obligatorios.' });
    }

    // Validar si el nuevo email ya está en uso por otro usuario (que no sea el propio usuario actual)
    const existingUserWithEmail = users.find(u => u.email === email && u.id !== req.user.id);
    if (existingUserWithEmail) {
        return res.status(409).json({ message: 'Este correo electrónico ya está en uso por otro usuario.' });
    }

    // Actualizar solo los campos permitidos (username y email)
    users[userIndex].username = username;
    users[userIndex].email = email;

    console.log(`Perfil de usuario ${req.user.username} (ID: ${req.user.id}) actualizado.`);
    // Devolver el perfil actualizado sin la contraseña
    const { password, ...updatedProfile } = users[userIndex];
    res.status(200).json({ message: 'Perfil actualizado con éxito', user: updatedProfile });
});

// Ruta para cambiar la contraseña
router.put('/profile/password', isAuthenticated, (req, res) => {
    console.log('Solicitud PUT /api/auth/profile/password recibida para usuario:', req.user.username);
    const { currentPassword, newPassword } = req.body;

    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar la contraseña actual (simulación)
    if (users[userIndex].password !== currentPassword) {
        return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
    }

    if (!newPassword || newPassword.length < 6) { // Ejemplo de validación de longitud
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    // Actualizar la contraseña (simulación)
    users[userIndex].password = newPassword;
    console.log(`Contraseña de usuario ${req.user.username} (ID: ${req.user.id}) actualizada.`);
    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
});



module.exports = router;