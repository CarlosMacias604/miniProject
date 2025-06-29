// Utilidades JavaScript para CINEMAX
// Funciones utilitarias reutilizables en toda la aplicación

const Utils = {
    // Validaciones
    validation: {
        isValidEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        isValidPassword: (password) => {
            const config = CONFIG.VALIDATION.PASSWORD;
            if (password.length < config.MIN_LENGTH) return false;
            
            if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false;
            if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false;
            if (config.REQUIRE_NUMBERS && !/\d/.test(password)) return false;
            if (config.REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
            
            return true;
        },

        isValidUsername: (username) => {
            const config = CONFIG.VALIDATION.USERNAME;
            return username.length >= config.MIN_LENGTH && username.length <= config.MAX_LENGTH;
        }
    },

    // Formateo
    format: {
        currency: (amount) => {
            return new Intl.NumberFormat(CONFIG.FORMATS.CURRENCY.LOCALE, ConfigUtils.getCurrencyFormat()).format(amount);
        },

        date: (dateString) => {
            return new Date(dateString).toLocaleDateString(CONFIG.FORMATS.DATE.LOCALE, CONFIG.FORMATS.DATE.OPTIONS);
        },

        time: (timeString) => {
            // Si es datetime completo, extraer solo la hora
            if (timeString.includes('T')) {
                timeString = timeString.split('T')[1];
            }
            return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(CONFIG.FORMATS.TIME.LOCALE, CONFIG.FORMATS.TIME.OPTIONS);
        },

        dateTime: (dateTimeString) => {
            return new Date(dateTimeString).toLocaleString(CONFIG.FORMATS.DATE.LOCALE, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        capitalize: (str) => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        truncate: (str, maxLength = 100) => {
            return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
        }
    },

    // Manipulación DOM
    dom: {
        createElement: (tag, className = '', innerHTML = '') => {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            return element;
        },

        show: (elementId) => {
            const element = document.getElementById(elementId);
            if (element) element.style.display = 'block';
        },

        hide: (elementId) => {
            const element = document.getElementById(elementId);
            if (element) element.style.display = 'none';
        },

        toggle: (elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        },

        addClass: (elementId, className) => {
            const element = document.getElementById(elementId);
            if (element) element.classList.add(className);
        },

        removeClass: (elementId, className) => {
            const element = document.getElementById(elementId);
            if (element) element.classList.remove(className);
        },

        hasClass: (elementId, className) => {
            const element = document.getElementById(elementId);
            return element ? element.classList.contains(className) : false;
        }
    },

    // Almacenamiento local
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                ConfigUtils.errorLog('Error saving to localStorage', error);
                return false;
            }
        },

        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                ConfigUtils.errorLog('Error reading from localStorage', error);
                return null;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                ConfigUtils.errorLog('Error removing from localStorage', error);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                ConfigUtils.errorLog('Error clearing localStorage', error);
                return false;
            }
        }
    },

    // Utilidades de tiempo
    time: {
        now: () => new Date(),
        
        formatDuration: (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        },

        isToday: (dateString) => {
            const today = new Date();
            const date = new Date(dateString);
            return date.toDateString() === today.toDateString();
        },

        isFuture: (dateString) => {
            return new Date(dateString) > new Date();
        },

        daysBetween: (date1, date2) => {
            const oneDay = 24 * 60 * 60 * 1000;
            return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
        }
    },

    // Utilidades de array
    array: {
        unique: (arr) => [...new Set(arr)],
        
        groupBy: (arr, key) => {
            return arr.reduce((groups, item) => {
                const group = (groups[item[key]] = groups[item[key]] || []);
                group.push(item);
                return groups;
            }, {});
        },

        sortBy: (arr, key, ascending = true) => {
            return arr.sort((a, b) => {
                if (ascending) {
                    return a[key] > b[key] ? 1 : -1;
                } else {
                    return a[key] < b[key] ? 1 : -1;
                }
            });
        },

        shuffle: (arr) => {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
    },

    // Utilidades de string
    string: {
        slugify: (str) => {
            return str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },

        randomString: (length = 10) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        escapeHtml: (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    },

    // Utilidades de números
    number: {
        random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        clamp: (num, min, max) => Math.min(Math.max(num, min), max),
        
        round: (num, decimals = 2) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
        
        isNumeric: (str) => !isNaN(str) && !isNaN(parseFloat(str)),
        
        formatNumber: (num, locale = 'es-MX') => {
            return new Intl.NumberFormat(locale).format(num);
        }
    },

    // Debounce para optimizar llamadas
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para limitar frecuencia de llamadas
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Utilidades de dispositivo
    device: {
        isMobile: () => window.innerWidth <= 768,
        isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: () => window.innerWidth > 1024,
        
        hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        
        getViewport: () => ({
            width: window.innerWidth,
            height: window.innerHeight
        })
    },

    // Utilidades de red
    network: {
        isOnline: () => navigator.onLine,
        
        getConnectionType: () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            return connection ? connection.effectiveType : 'unknown';
        }
    }
};

// Event Emitter simple para comunicación entre componentes
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }

    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Instancia global del event emitter
const eventBus = new EventEmitter();

// Añadir al objeto global window para uso en toda la aplicación
window.Utils = Utils;
window.EventEmitter = EventEmitter;
window.eventBus = eventBus;
