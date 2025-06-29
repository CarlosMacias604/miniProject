// TESTING - Funcionalidades PDF y Asientos Ocupados
// =====================================================

// Este archivo contiene pruebas para verificar que las nuevas funcionalidades funcionan correctamente

console.log('🎬 CINEMAX - Testing nuevas funcionalidades');
console.log('=====================================================');

// Test 1: Verificar que jsPDF está disponible
function testPDFLibrary() {
    console.log('📋 Test 1: Verificando librería jsPDF...');
    
    if (typeof window !== 'undefined' && window.jspdf) {
        console.log('✅ jsPDF está disponible');
        return true;
    } else {
        console.log('❌ jsPDF no está disponible');
        return false;
    }
}

// Test 2: Verificar función de generar PDF
function testPDFGeneration() {
    console.log('📋 Test 2: Verificando función de generar PDF...');
    
    if (typeof generarPDFTicket === 'function') {
        console.log('✅ Función generarPDFTicket está definida');
        return true;
    } else {
        console.log('❌ Función generarPDFTicket no está definida');
        return false;
    }
}

// Test 3: Verificar función de generar PDF desde historial
function testPDFFromHistory() {
    console.log('📋 Test 3: Verificando función de generar PDF desde historial...');
    
    if (typeof generarPDFHistorial === 'function') {
        console.log('✅ Función generarPDFHistorial está definida');
        return true;
    } else {
        console.log('❌ Función generarPDFHistorial no está definida');
        return false;
    }
}

// Test 4: Verificar corrección de asientos ocupados
function testSeatsLogic() {
    console.log('📋 Test 4: Verificando lógica de asientos ocupados...');
    
    if (typeof cargarAsientos === 'function' && typeof generarAsientos === 'function') {
        console.log('✅ Funciones de asientos están definidas');
        return true;
    } else {
        console.log('❌ Funciones de asientos no están definidas');
        return false;
    }
}

// Ejecutar todos los tests cuando se cargue la página
function runAllTests() {
    console.log('🚀 Ejecutando todos los tests...');
    console.log('');
    
    const results = [
        testPDFLibrary(),
        testPDFGeneration(),
        testPDFFromHistory(),
        testSeatsLogic()
    ];
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('');
    console.log('📊 RESULTADOS:');
    console.log(`✅ Tests pasados: ${passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 ¡Todas las funcionalidades están disponibles!');
    } else {
        console.log('⚠️  Algunas funcionalidades pueden no estar disponibles');
    }
    
    console.log('=====================================================');
}

// Ejecutar tests cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Funciones de ayuda para debugging
window.debugCinemax = {
    testPDF: () => {
        if (typeof generarPDFTicket === 'function') {
            console.log('Probando generación de PDF...');
            // Datos de prueba
            generarPDFTicket(12345, 240, 'A5, A6');
        } else {
            console.log('Función generarPDFTicket no disponible');
        }
    },
    
    testSeats: () => {
        console.log('Estado actual de asientos seleccionados:', selectedSeats);
        console.log('Película actual:', currentMovie);
        console.log('Showtime seleccionado:', selectedShowtime);
    },
    
    testUser: () => {
        console.log('Usuario actual:', currentUser);
    }
};

console.log('💡 Para debuggear, usa: window.debugCinemax.testPDF(), window.debugCinemax.testSeats(), etc.');
