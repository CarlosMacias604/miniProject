// Configuración del Sistema CINEMAX
// Este archivo contiene todas las configuraciones centralizadas

const CONFIG = {
    // Configuración de la API
    API: {
        BASE_URL: 'http://localhost:5000',
        ENDPOINTS: {
            // Autenticación
            LOGIN: '/auth/login',
            REFRESH: '/auth/refresh',
            
            // Películas
            MOVIES_ALL: '/movies/all',
            MOVIES_BY_ID: '/movies/by_id',  
            MOVIES_SEARCH: '/movies/search',
            
            // Horarios
            SHOWTIMES_ALL: '/showtimes/all',
            SHOWTIMES_BY_ID: '/showtimes/by_id',
            
            // Ventas
            SALES_ALL: '/sales/all',
            SALES_CREATE: '/sales/create',
            SALES_BY_ID: '/sales/by_id',
            
            // Asientos Reservados
            RESERVED_SEATS_ALL: '/reserved_seats/all',
            RESERVED_SEATS_CREATE: '/reserved_seats/create',
            
            // Teatros/Salas
            THEATERS_ALL: '/theaters/all',
            THEATERS_CREATE: '/theaters/create',
            THEATERS_UPDATE: '/theaters/update',
            THEATERS_DELETE: '/theaters/delete',
            
            // Usuarios
            USERS_ALL: '/users/all',
            USERS_CREATE: '/users/create',
            USERS_UPDATE: '/users/update',
            USERS_DELETE: '/users/delete',
            
            // Membresías
            MEMBERSHIPS_ALL: '/memberships/all',
            MEMBERSHIPS_CREATE: '/memberships/create',
            MEMBERSHIPS_UPDATE: '/memberships/update',
            MEMBERSHIPS_DELETE: '/memberships/delete'
        }
    },

    // Configuración de TMDB (The Movie Database)
    TMDB: {
        BASE_URL: 'https://image.tmdb.org/t/p/',
        SIZES: {
            POSTER: {
                SMALL: 'w92',
                MEDIUM: 'w185', 
                LARGE: 'w342',
                XLARGE: 'w500',
                XXLARGE: 'w780',
                ORIGINAL: 'original'
            },
            BACKDROP: {
                SMALL: 'w300',
                MEDIUM: 'w780',
                LARGE: 'w1280',
                ORIGINAL: 'original'
            },
            PROFILE: {
                SMALL: 'w45',
                MEDIUM: 'w185',
                LARGE: 'h632',
                ORIGINAL: 'original'
            },
            LOGO: {
                SMALL: 'w45',
                MEDIUM: 'w92',
                LARGE: 'w154',
                XLARGE: 'w185',
                XXLARGE: 'w300',
                XXXLARGE: 'w500',
                ORIGINAL: 'original'
            }
        }
    },

    // Configuración de la UI
    UI: {
        NOTIFICATIONS: {
            DURATION: 5000, // 5 segundos
            POSITION: 'top-right'
        },
        LOADING: {
            MIN_DURATION: 300 // Mínimo tiempo para mostrar loading
        },
        CINEMA: {
            MAX_SEATS_PER_PURCHASE: 8,
            ROWS: 8, // A-H
            SEATS_PER_ROW: 12,
            DEFAULT_PRICE: 120
        },
        MODALS: {
            CLOSE_ON_OUTSIDE_CLICK: true
        }
    },

    // Configuración de localStorage
    STORAGE: {
        KEYS: {
            AUTH_TOKEN: 'authToken',
            REFRESH_TOKEN: 'refreshToken', 
            CURRENT_USER: 'currentUser',
            PREFERENCES: 'userPreferences'
        }
    },

    // Configuración de formatos
    FORMATS: {
        CURRENCY: {
            LOCALE: 'es-MX',
            CURRENCY: 'MXN'
        },
        DATE: {
            LOCALE: 'es-MX',
            OPTIONS: {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
            }
        },
        TIME: {
            LOCALE: 'es-MX',
            OPTIONS: {
                hour: '2-digit',
                minute: '2-digit'
            }
        }
    },

    // Configuración de validaciones
    VALIDATION: {
        PASSWORD: {
            MIN_LENGTH: 6,
            REQUIRE_UPPERCASE: false,
            REQUIRE_LOWERCASE: false,
            REQUIRE_NUMBERS: false,
            REQUIRE_SYMBOLS: false
        },
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 50
        }
    },

    // Configuración de debug
    DEBUG: {
        ENABLED: true, // Cambiar a false en producción
        LOG_API_CALLS: true,
        LOG_ERRORS: true
    },

    // Mensajes del sistema
    MESSAGES: {
        SUCCESS: {
            LOGIN: '¡Inicio de sesión exitoso!',
            LOGOUT: 'Sesión cerrada correctamente',
            PURCHASE: '¡Compra realizada exitosamente!',
            SEAT_SELECTED: 'Asiento seleccionado',
            SEAT_DESELECTED: 'Asiento deseleccionado'
        },
        ERROR: {
            LOGIN_FAILED: 'Error al iniciar sesión',
            LOGIN_REQUIRED: 'Por favor ingresa usuario y contraseña',
            NETWORK_ERROR: 'Error de conexión',
            INVALID_TOKEN: 'Sesión expirada, por favor inicia sesión nuevamente',
            MAX_SEATS: 'Máximo 8 asientos por compra',
            NO_SEATS_SELECTED: 'Selecciona al menos un asiento',
            LOAD_MOVIES_FAILED: 'Error al cargar películas',
            LOAD_SHOWTIMES_FAILED: 'Error al cargar horarios',
            LOAD_SEATS_FAILED: 'Error al cargar asientos',
            PURCHASE_FAILED: 'Error al procesar la compra'
        },
        INFO: {
            LOADING: 'Cargando...',
            SEARCHING: 'Buscando...',
            NO_MOVIES: 'No se encontraron películas',
            NO_SHOWTIMES: 'No hay horarios disponibles para esta película',
            NO_PURCHASES: 'No hay compras registradas',
            SELECT_SEATS: 'Selecciona tus asientos'
        }
    }
};

// Funciones utilitarias de configuración
const ConfigUtils = {
    // Construir URL completa de la API
    getApiUrl: (endpoint) => {
        return `${CONFIG.API.BASE_URL}${endpoint}`;
    },

    // Construir URL de imagen TMDB
    buildImageUrl: (imagePath, type = 'POSTER', size = 'LARGE') => {
        if (!imagePath) {
            return 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        }
        
        const sizeValue = CONFIG.TMDB.SIZES[type][size] || CONFIG.TMDB.SIZES[type].LARGE;
        return `${CONFIG.TMDB.BASE_URL}${sizeValue}${imagePath}`;
    },

    // Obtener configuración de formato de moneda
    getCurrencyFormat: () => {
        return {
            style: 'currency',
            currency: CONFIG.FORMATS.CURRENCY.CURRENCY
        };
    },

    // Verificar si el debug está habilitado
    isDebugEnabled: () => {
        return CONFIG.DEBUG.ENABLED;
    },

    // Log condicional basado en configuración de debug
    debugLog: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.LOG_API_CALLS) {
            console.log(`[CINEMAX DEBUG] ${message}`, ...args);
        }
    },

    // Log de errores condicional
    errorLog: (message, error) => {
        if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.LOG_ERRORS) {
            console.error(`[CINEMAX ERROR] ${message}`, error);
        }
    }
};

// Exportar configuración (si se usa módulos ES6)
// export { CONFIG, ConfigUtils };

// Para uso global en el navegador
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;
