// Script de prueba rápida para CINEMAX
// Abrir en la consola del navegador para probar las funciones

console.log('🎬 CINEMAX - Prueba Rápida Iniciada');

// Función para probar la carga de películas sin autenticación
async function probarPeliculas() {
    console.log('🎭 Probando carga de películas...');
    try {
        // Simular token temporal para prueba
        localStorage.setItem('authToken', 'test-token');
        
        const response = await fetch('http://localhost:5000/movies/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        });
        
        const data = await response.json();
        console.log('✅ Películas obtenidas:', data);
        
        if (data.movies && data.movies.length > 0) {
            console.log('🎥 Primera película:', data.movies[0]);
            
            // Construir URL de imagen de prueba
            const firstMovie = data.movies[0];
            if (firstMovie.poster_url) {
                const imageUrl = `https://image.tmdb.org/t/p/w342${firstMovie.poster_url}`;
                console.log('🖼️ URL de imagen:', imageUrl);
            }
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Función para probar el sistema de notificaciones
function probarNotificaciones() {
    console.log('🔔 Probando notificaciones...');
    
    if (typeof showNotification === 'function') {
        showNotification('✅ Notificación de éxito', 'success');
        
        setTimeout(() => {
            showNotification('⚠️ Notificación de advertencia', 'info');
        }, 1000);
        
        setTimeout(() => {
            showNotification('❌ Notificación de error', 'error');
        }, 2000);
        
        console.log('✅ Notificaciones enviadas');
    } else {
        console.error('❌ Función showNotification no disponible');
    }
}

// Función para probar la construcción de URLs de imagen
function probarImagenes() {
    console.log('🖼️ Probando construcción de URLs de imagen...');
    
    const testPosterPath = '/frNkbc1QpexF3aUZzN1xF3t5Hw.jpg';
    
    if (typeof ConfigUtils !== 'undefined') {
        const urls = {
            small: ConfigUtils.buildImageUrl(testPosterPath, 'POSTER', 'SMALL'),
            medium: ConfigUtils.buildImageUrl(testPosterPath, 'POSTER', 'MEDIUM'),
            large: ConfigUtils.buildImageUrl(testPosterPath, 'POSTER', 'LARGE'),
            xlarge: ConfigUtils.buildImageUrl(testPosterPath, 'POSTER', 'XLARGE')
        };
        
        console.log('✅ URLs generadas:', urls);
        return urls;
    } else {
        console.error('❌ ConfigUtils no disponible');
    }
}

// Función para verificar el DOM
function verificarDOM() {
    console.log('🏗️ Verificando elementos del DOM...');
    
    const elementos = {
        loginSection: document.getElementById('loginSection'),
        carteleraSection: document.getElementById('carteleraSection'),
        moviesGrid: document.getElementById('moviesGrid'),
        notifications: document.getElementById('notifications'),
        loadingSpinner: document.getElementById('loadingSpinner')
    };
    
    Object.entries(elementos).forEach(([name, element]) => {
        if (element) {
            console.log(`✅ ${name}: encontrado`);
        } else {
            console.error(`❌ ${name}: no encontrado`);
        }
    });
    
    return elementos;
}

// Función para simular un login exitoso
function simularLogin() {
    console.log('🔐 Simulando login exitoso...');
    
    const userData = {
        id: 1,
        username: 'test_user',
        role: 'cliente'
    };
    
    localStorage.setItem('authToken', 'test-token-12345');
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Simular cambio a cartelera
    if (typeof showMainApp === 'function') {
        showMainApp();
        console.log('✅ Aplicación principal mostrada');
    }
    
    console.log('✅ Login simulado completado');
    return userData;
}

// Ejecutar todas las pruebas
async function ejecutarTodasLasPruebas() {
    console.log('🚀 Ejecutando todas las pruebas...');
    
    verificarDOM();
    probarImagenes();
    probarNotificaciones();
    
    // Esperar un poco antes de probar la API
    setTimeout(async () => {
        await probarPeliculas();
        console.log('🎯 Todas las pruebas completadas');
    }, 1000);
}

// Mostrar funciones disponibles
console.log('🛠️ Funciones de prueba disponibles:');
console.log('- probarPeliculas(): Prueba la carga de películas');
console.log('- probarNotificaciones(): Prueba el sistema de notificaciones');
console.log('- probarImagenes(): Prueba la construcción de URLs de imagen');
console.log('- verificarDOM(): Verifica elementos del DOM');
console.log('- simularLogin(): Simula un login exitoso');
console.log('- ejecutarTodasLasPruebas(): Ejecuta todas las pruebas');

console.log('📌 Para ejecutar todas las pruebas: ejecutarTodasLasPruebas()');

// Auto-ejecutar verificación básica
verificarDOM();
