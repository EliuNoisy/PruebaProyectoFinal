// Funciones de utilidad
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.background = 'rgba(87, 255, 87, 0.2)';
        errorDiv.style.borderColor = 'rgba(87, 255, 87, 0.5)';
        setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.style.background = 'rgba(255, 87, 87, 0.2)';
            errorDiv.style.borderColor = 'rgba(255, 87, 87, 0.5)';
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.replace('index.html');
}

// Funciones de autenticacion
function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr || userStr === 'undefined') {
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error al parsear usuario:', error);
        return null;
    }
}

function isAuthenticated() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.replace('index.html');
}

// API Functions
async function registerUser(userData) {
    try {
        const response = await fetch('https://portfolio-api-three-black.vercel.app/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch('https://portfolio-api-three-black.vercel.app/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesion');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Proteccion de rutas - EJECUCION INMEDIATA
(function protectRoutes() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Proteger home.html - PRIORIDAD MAXIMA
    if (currentPage === 'home.html') {
        if (!isAuthenticated()) {
            // Redireccion inmediata sin delay
            window.location.replace('index.html');
            // Detener ejecucion de cualquier script
            throw new Error('Acceso no autorizado');
        }
        
        const user = getCurrentUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `Bienvenido ${user.name}`;
            }
        }
    }
    
    // Redirigir si ya esta autenticado
    if (isAuthenticated() && (currentPage === 'index.html' || currentPage === 'register.html' || currentPage === '')) {
        window.location.replace('home.html');
        return;
    }
})();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showError('Por favor completa todos los campos');
                return;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesion...';
            
            try {
                const data = await loginUser({ email, password });
                
                // Guardar token y usuario
                saveToken(data.token);
                saveCurrentUser(data.user);
                
                console.log('Token guardado:', data.token);
                console.log('Usuario guardado:', data.user);
                
                showSuccess('Inicio de sesion exitoso');
                
                setTimeout(() => {
                    window.location.replace('home.html');
                }, 1000);
                
            } catch (error) {
                showError(error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesion';
            }
        });
    }
    
    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const itsonId = document.getElementById('itsonId').value.trim();
            
            if (!name || !email || !password || !itsonId) {
                showError('Por favor completa todos los campos');
                return;
            }
            
            if (name.length < 6) {
                showError('El nombre debe tener al menos 6 caracteres');
                return;
            }
            
            if (password.length < 6) {
                showError('La contrasena debe tener al menos 6 caracteres');
                return;
            }
            
            if (itsonId.length !== 6 || !/^\d+$/.test(itsonId)) {
                showError('El ID ITSON debe tener exactamente 6 digitos numericos');
                return;
            }
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';
            
            try {
                await registerUser({
                    name,
                    email,
                    password,
                    itsonId
                });
                
                showSuccess('Registro exitoso. Redirigiendo al login...');
                
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 2000);
                
            } catch (error) {
                showError(error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Estas seguro que deseas cerrar sesion?')) {
                logout();
            }
        });
    }
});

// Exponer la funcion logout globalmente para debugging
window.logout = logout;