// Script de prueba para CINEMAX
// Ejecutar en la consola del navegador para probar funcionalidades

console.log('🎬 CINEMAX - Script de Prueba');

// 1. Verificar que CONFIG esté cargado
if (typeof CONFIG === 'undefined') {
    console.error('❌ CONFIG no está cargado');
} else {
    console.log('✅ CONFIG cargado:', CONFIG.API.BASE_URL);
}

// 2. Verificar que Utils esté cargado
if (typeof Utils === 'undefined') {
    console.error('❌ Utils no está cargado');
} else {
    console.log('✅ Utils cargado');
}

// 3. Probar función de formateo
if (typeof Utils !== 'undefined') {
    console.log('💰 Formateo de moneda:', Utils.format.currency(120));
    console.log('📅 Formateo de fecha:', Utils.format.date('2025-06-27'));
}

// 4. Probar construcción de URL de imagen
if (typeof ConfigUtils !== 'undefined') {
    const testUrl = ConfigUtils.buildImageUrl('/example.jpg', 'POSTER', 'LARGE');
    console.log('🖼️ URL de imagen de prueba:', testUrl);
}

// 5. Verificar elementos del DOM
const elementos = {
    loginSection: document.getElementById('loginSection'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    notifications: document.getElementById('notifications'),
    loadingSpinner: document.getElementById('loadingSpinner')
};

console.log('🏗️ Elementos del DOM:');
Object.entries(elementos).forEach(([name, element]) => {
    if (element) {
        console.log(`✅ ${name}: encontrado`);
    } else {
        console.error(`❌ ${name}: no encontrado`);
    }
});

// 6. Función de prueba de login (sin hacer la petición real)
function pruebaLogin() {
    console.log('🔐 Simulando inicio de sesión...');
    
    // Simular usuario de prueba
    const testUser = {
        id: 1,
        username: 'admin',
        role: 'admin'
    };
    
    // Simular token
    const testToken = 'test-token-123';
    
    // Guardar en localStorage
    localStorage.setItem('authToken', testToken);
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    
    console.log('✅ Datos de prueba guardados');
    console.log('Usuario:', testUser);
    console.log('Token:', testToken);
    
    // Mostrar notificación de prueba
    if (typeof showNotification === 'function') {
        showNotification('¡Prueba de notificación exitosa!', 'success');
    }
}

// 7. Función para limpiar datos de prueba
function limpiarPrueba() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    console.log('🧹 Datos de prueba limpiados');
}

// 8. Mostrar funciones disponibles
console.log('🛠️ Funciones de prueba disponibles:');
console.log('- pruebaLogin(): Simula un login exitoso');
console.log('- limpiarPrueba(): Limpia los datos de prueba');

// 9. Verificar conectividad con la API (opcional)
async function probarAPI() {
    try {
        console.log('🌐 Probando conectividad con API...');
        const response = await fetch(CONFIG.API.BASE_URL + '/');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API respondió:', data);
        } else {
            console.warn('⚠️ API respondió con código:', response.status);
        }
    } catch (error) {
        console.error('❌ Error conectando con API:', error.message);
        console.log('💡 Asegúrate de que el backend esté corriendo en', CONFIG.API.BASE_URL);
    }
}

// Ejecutar prueba de API automáticamente
probarAPI();

console.log('🎯 Script de prueba completado. Revisa los resultados arriba.');
console.log('📝 Si hay errores, verifica que todos los archivos estén cargados correctamente.');
