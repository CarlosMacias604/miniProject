// DEBUG - Problema de carga de películas después del login
// =========================================================

console.log('🔍 DEBUG: Carga de películas después del login');

// Función para debuggear el flujo completo
window.debugLogin = {
    
    // Verificar estado actual
    checkCurrentState: () => {
        console.log('📊 ESTADO ACTUAL:');
        console.log('- Token:', Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN) ? '✅ Existe' : '❌ No existe');
        console.log('- Usuario:', currentUser ? '✅ Existe' : '❌ No existe');
        console.log('- Películas cargadas:', movies?.length || 0);
        console.log('- Sección cartelera visible:', document.getElementById('carteleraSection')?.style.display !== 'none' ? '✅ Visible' : '❌ Oculta');
        console.log('- Navegación visible:', document.getElementById('navigation')?.style.display !== 'none' ? '✅ Visible' : '❌ Oculta');
    },
    
    // Simular carga de películas
    testMovieLoad: async () => {
        console.log('🎬 PROBANDO CARGA DE PELÍCULAS...');
        try {
            await cargarPeliculas();
            console.log('✅ Carga exitosa');
        } catch (error) {
            console.error('❌ Error en carga:', error);
        }
    },
    
    // Simular showSection manual
    testShowSection: () => {
        console.log('📄 PROBANDO SHOW SECTION...');
        showSection('cartelera');
    },
    
    // Limpiar y reiniciar
    resetState: () => {
        console.log('🔄 REINICIANDO ESTADO...');
        currentUser = null;
        movies = [];
        carteleraCargada = false;
        Utils.storage.remove(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
        Utils.storage.remove(CONFIG.STORAGE.KEYS.CURRENT_USER);
        Utils.storage.remove(CONFIG.STORAGE.KEYS.REFRESH_TOKEN);
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('navigation').style.display = 'none';
        console.log('✅ Estado reiniciado');
    },
    
    // Monitorear cambios en tiempo real
    startMonitoring: () => {
        console.log('👁️ INICIANDO MONITOREO...');
        
        // Monitorear cambios en localStorage
        let lastToken = Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
        let lastUser = currentUser;
        let lastMovies = movies?.length || 0;
        
        const monitor = setInterval(() => {
            const currentToken = Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
            const currentMovies = movies?.length || 0;
            
            if (currentToken !== lastToken) {
                console.log('🔄 Token cambió:', lastToken ? 'Existía' : 'No existía', '→', currentToken ? 'Existe' : 'No existe');
                lastToken = currentToken;
            }
            
            if (currentUser !== lastUser) {
                console.log('🔄 Usuario cambió:', lastUser ? 'Existía' : 'No existía', '→', currentUser ? 'Existe' : 'No existe');
                lastUser = currentUser;
            }
            
            if (currentMovies !== lastMovies) {
                console.log('🔄 Películas cambiaron:', lastMovies, '→', currentMovies);
                lastMovies = currentMovies;
            }
        }, 1000);
        
        // Detener monitoreo después de 30 segundos
        setTimeout(() => {
            clearInterval(monitor);
            console.log('⏹️ Monitoreo detenido');
        }, 30000);
    }
};

// Interceptar llamadas a showMainApp para debug
const originalShowMainApp = showMainApp;
showMainApp = function(forceRedirectToCartelera = false) {
    console.log('🚀 showMainApp llamado con forceRedirectToCartelera:', forceRedirectToCartelera);
    console.log('📊 Estado antes de showMainApp:');
    console.log('- Token:', Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN) ? 'Existe' : 'No existe');
    console.log('- Usuario:', currentUser ? 'Existe' : 'No existe');
    
    const result = originalShowMainApp.call(this, forceRedirectToCartelera);
    
    setTimeout(() => {
        console.log('📊 Estado después de showMainApp:');
        console.log('- Cartelera visible:', document.getElementById('carteleraSection')?.style.display !== 'none' ? 'Sí' : 'No');
        console.log('- Navegación visible:', document.getElementById('navigation')?.style.display !== 'none' ? 'Sí' : 'No');
        console.log('- Películas:', movies?.length || 0);
    }, 500);
    
    return result;
};

// Interceptar llamadas a cargarPeliculas para debug
const originalCargarPeliculas = cargarPeliculas;
cargarPeliculas = async function() {
    console.log('🎬 cargarPeliculas llamado');
    console.log('- Token disponible:', Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN) ? 'Sí' : 'No');
    
    const result = await originalCargarPeliculas.call(this);
    
    console.log('🎬 cargarPeliculas terminado');
    console.log('- Películas resultantes:', movies?.length || 0);
    
    return result;
};

console.log('🛠️ Debug tools disponibles:');
console.log('- window.debugLogin.checkCurrentState()');
console.log('- window.debugLogin.testMovieLoad()');
console.log('- window.debugLogin.testShowSection()');
console.log('- window.debugLogin.resetState()');
console.log('- window.debugLogin.startMonitoring()');
