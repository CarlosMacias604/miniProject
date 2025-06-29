// Test rápido de las funciones principales
console.log('🧪 Iniciando tests de funciones...');

// Test de existencia de funciones principales
const functionsToTest = [
    'cargarUsuarios',
    'mostrarTablaUsuarios', 
    'cargarPeliculasAdmin',
    'mostrarTablaPeliculasAdmin',
    'cargarSalas',
    'mostrarTablaSalas',
    'cargarMembresias', 
    'mostrarTablaMembresias',
    'cargarHorariosAdmin',
    'mostrarTablaHorarios',
    'initializeAllForms',
    'abrirModalCrearUsuario',
    'abrirModalCrearPelicula',
    'abrirModalCrearSala',
    'abrirModalCrearMembresia',
    'guardarUsuario',
    'guardarPelicula',
    'guardarSala',
    'guardarMembresia',
    // Funciones de membresías para customers
    'cargarMembresiasCustomer',
    'cargarMembresiaActual',
    'cargarMembresiasDisponibles',
    'mostrarMembresiaActual',
    'mostrarSinMembresia',
    'mostrarMembresiasDisponibles',
    'adquirirMembresia',
    'cancelarMembresia'
];

functionsToTest.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        console.log(`✅ ${funcName} - OK`);
    } else {
        console.log(`❌ ${funcName} - FALTA`);
    }
});

console.log('🧪 Tests completados');
