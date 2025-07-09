// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos que pueden existir solo en ciertas páginas (ej. dashboard.html)
    const userNameSpan = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRole');
    const logoutButton = document.getElementById('logoutButton');

    // Recuperar datos del usuario desde localStorage (asegúrate de que login.js guarde 'username' y 'userRole')
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserName = localStorage.getItem('userName'); // <--- ¡Importante: usa 'username' consistente!

    // --- Lógica Principal: Verificar autenticación y redirigir si no hay datos ---
    if (storedUserRole && storedUserName) {
        // Actualizar el nombre y rol si los elementos existen en la página actual (solo en dashboard.html)
        if (userNameSpan) {
            userNameSpan.textContent = storedUserName;
        }
        if (userRoleSpan) {
            userRoleSpan.textContent = storedUserRole;
        }

        // --- Lógica para mostrar/ocultar enlaces de navegación basada en el rol ---
        // Referencias a todos los enlaces de navegación por rol
        const navAdminElements = document.querySelectorAll('.nav-admin');
        const navParentElements = document.querySelectorAll('.nav-parent');
        const navStudentElements = document.querySelectorAll('.nav-student');
        const navTeacherElements = document.querySelectorAll('.nav-teacher'); // Si tienes este rol
        const messagesLinkElement = document.getElementById('messagesLink'); // Obtener el enlace de mensajes
        


        // Ocultar todos los enlaces de rol por defecto
        navAdminElements.forEach(el => el.style.display = 'none');
        navParentElements.forEach(el => el.style.display = 'none');
        navStudentElements.forEach(el => el.style.display = 'none');
        navTeacherElements.forEach(el => el.style.display = 'none'); // Ocultar si existe
        if (messagesLinkElement) { 
            messagesLinkElement.closest('li').style.display = 'none';
        }


        // Mostrar enlaces según el rol del usuario
        if (storedUserRole === 'Admin') {
            navAdminElements.forEach(el => el.style.display = 'list-item'); // O 'block' o tu display preferido
            // Si el admin también puede ver la vista de padre, descomenta:
            // navParentElements.forEach(el => el.style.display = 'list-item');
            // NUEVA LÍNEA: Asegura que el enlace de asignación sea visible para el Admin
            const assignCoursesLink = document.querySelector('a[href="/admin/assign_courses.html"]');
            if (assignCoursesLink) {
                assignCoursesLink.closest('li').style.display = 'list-item';
            }
        } else if (['Padre', 'Madre', 'Tutor'].includes(storedUserRole)) {
            navParentElements.forEach(el => el.style.display = 'list-item');
            // ¡ESTA ES LA LÍNEA CRUCIAL QUE DEBE ESTAR AHÍ!
            // Asegúrate de que el enlace de notificaciones esté visible para padres
            const parentNotificationsLink = document.querySelector('a[href="/parent/my_notifications.html"]');
            if (parentNotificationsLink) {
                parentNotificationsLink.closest('li').style.display = 'list-item';
            }
            const parentGradesLink = document.querySelector('a[href="/parent/grades.html"]');
            if (parentGradesLink) {
                parentGradesLink.closest('li').style.display = 'list-item';
            }


        } else if (storedUserRole === 'Student') {
            navStudentElements.forEach(el => el.style.display = 'list-item');

        } else if (storedUserRole === 'Teacher') {
            navTeacherElements.forEach(el => el.style.display = 'list-item');
            // Asegúrate de que el enlace a /teacher/my_courses.html esté presente en tu HTML
            // y tenga la clase nav-teacher para que la línea anterior lo muestre.
        }

        if (messagesLinkElement) {
            messagesLinkElement.closest('li').style.display = 'list-item';
        }
        // No necesitamos un 'else' o 'default' aquí para los enlaces, ya están ocultos por defecto.

    } else {
        // Si no hay datos de usuario en localStorage, redirigir al login
        console.log('No user data found in localStorage. Redirecting to login.');
        window.location.href = '/login.html';
    }

    // --- Manejo del Cierre de Sesión ---
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Limpiar todos los datos relevantes del usuario en localStorage
            localStorage.removeItem('token'); // Si lo estás usando
            localStorage.removeItem('userId');
            localStorage.removeItem('userName'); // ¡Importante: usa 'username' aquí!
            localStorage.removeItem('userRole');

            alert('Has cerrado sesión.'); // O un mensaje más elegante
            window.location.href = '/login.html'; // Redirigir al login
        });
    }
});