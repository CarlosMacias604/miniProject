// Configuración de la API
const API_BASE_URL = CONFIG.API.BASE_URL;
const TMDB_BASE_URL = CONFIG.TMDB.BASE_URL;

// Variables globales
let currentUser = null;
let movies = [];
let currentMovie = null;
let selectedShowtime = null;
let selectedSeats = [];
let userPurchases = [];

// Utility Functions
class APIClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token de autorización si está disponible
        const token = Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
        if (token && !endpoint.includes('/auth/login')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            showLoading(true);
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Error en la petición');
            }
            
            return data;
        } catch (error) {
            console.error('Error en la petición:', error);
            showNotification('Error: ' + error.message, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    }

    static async get(endpoint, data = {}) {
        // Para GET, los parámetros van en la URL, no en el body
        const params = new URLSearchParams(data);
        const queryString = params.toString();
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(fullEndpoint, {
            method: 'GET'
            // No se incluye body en peticiones GET
        });
    }

    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }
}

// Utilidades de UI
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 
                      type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function formatCurrency(amount) {
    return Utils.format.currency(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        return Utils.format.date(dateString);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Fecha inválida';
    }
}

function formatTime(timeString) {
    if (!timeString) return 'Hora no disponible';
    
    try {
        // Si es solo tiempo (HH:MM), añadir fecha ficticia para parsing
        const timeToFormat = timeString.includes('T') ? timeString : `1970-01-01T${timeString}`;
        const date = new Date(timeToFormat);
        if (isNaN(date.getTime())) {
            return 'Hora inválida';
        }
        return Utils.format.time(timeString);
    } catch (error) {
        console.error('Error formateando hora:', error);
        return 'Hora inválida';
    }
}

// Funciones de construcción de URLs de imágenes
function buildImageUrl(posterPath, size = 'LARGE') {
    return ConfigUtils.buildImageUrl(posterPath, 'POSTER', size);
}

function buildBackdropUrl(backdropPath, size = 'LARGE') {
    return ConfigUtils.buildImageUrl(backdropPath, 'BACKDROP', size);
}

// Función para decodificar JWT y extraer información del usuario
function decodeJWT(token) {
    try {
        // Dividir el token en sus partes
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Token JWT inválido');
        }
        
        // Decodificar la parte del payload (segunda parte)
        const payload = parts[1];
        
        // Añadir padding si es necesario
        let decodedPayload = payload;
        while (decodedPayload.length % 4) {
            decodedPayload += '=';
        }
        
        // Decodificar base64
        const jsonPayload = atob(decodedPayload);
        
        // Parsear JSON
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
    }
}

// Funciones de Autenticación
async function iniciarSesion() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        showNotification(CONFIG.MESSAGES.ERROR.LOGIN_REQUIRED, 'error');
        return;
    }

    try {
        const response = await APIClient.post(CONFIG.API.ENDPOINTS.LOGIN, {
            username: username,
            password: password
        });

        if (response.access_token) {
            Utils.storage.set(CONFIG.STORAGE.KEYS.AUTH_TOKEN, response.access_token);
            Utils.storage.set(CONFIG.STORAGE.KEYS.REFRESH_TOKEN, response.refresh_token);
            
            // Decodificar el JWT para obtener información del usuario
            const tokenData = decodeJWT(response.access_token);
            console.log('Token decodificado:', tokenData);
            
            if (tokenData) {
                currentUser = {
                    user_id: tokenData.user_id || tokenData.id,
                    username: tokenData.username,
                    role: tokenData.role
                };
            } else {
                // Fallback si no se puede decodificar el token
                currentUser = {
                    user_id: response.user_id,
                    username: response.username,
                    role: response.role
                };
            }
            
            console.log('Usuario actual establecido:', currentUser);
            Utils.storage.set(CONFIG.STORAGE.KEYS.CURRENT_USER, currentUser);
            
            showNotification(CONFIG.MESSAGES.SUCCESS.LOGIN, 'success');
            
            // Dar un pequeño delay para asegurar que el token se guarde correctamente
            setTimeout(() => {
                showMainApp(true); // Forzar redirección después del login
            }, 100);
        }
    } catch (error) {
        showNotification(CONFIG.MESSAGES.ERROR.LOGIN_FAILED + ': ' + error.message, 'error');
    }
}

function cerrarSesion() {
    Utils.storage.remove(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
    Utils.storage.remove(CONFIG.STORAGE.KEYS.REFRESH_TOKEN);
    Utils.storage.remove(CONFIG.STORAGE.KEYS.CURRENT_USER);
    currentUser = null;
    movies = []; // Limpiar películas
    carteleraCargada = false; // Resetear estado de carga
    
    // Ocultar todas las secciones principales
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar solo la sección de login
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('navigation').style.display = 'none';
    
    // Limpiar formulario
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showNotification(CONFIG.MESSAGES.SUCCESS.LOGOUT, 'info');
}

let carteleraCargada = false; 

function showMainApp(forceRedirectToCartelera = false) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('navigation').style.display = 'flex';

    configureNavigationByRole();

    if (forceRedirectToCartelera) {
        // Forzar mostrar cartelera después del login
        showSection('cartelera');
        carteleraCargada = true;
    } else {
        const activeSections = document.querySelectorAll('.main-section[style*="display: block"], .main-section:not([style*="display: none"])');
        const visibleSection = Array.from(activeSections).find(section =>
            section.id !== 'loginSection' &&
            section.style.display !== 'none' &&
            !section.style.display.includes('none')
        );

        if (!visibleSection) {
            // Si no hay sección visible, mostrar cartelera por defecto
            showSection('cartelera');
            carteleraCargada = true;
        }
    }
}

// Funciones de Navegación
// Configurar navegación basada en el rol del usuario
function configureNavigationByRole() {
    if (!currentUser || !currentUser.role) {
        console.error('No hay usuario o rol definido');
        return;
    }
    
    const userRole = currentUser.role;
    console.log('Configurando navegación para rol:', userRole);
    
    // Obtener todos los botones de navegación con roles
    const navButtons = document.querySelectorAll('.nav-btn[data-roles]');
    
    navButtons.forEach(button => {
        const allowedRoles = button.getAttribute('data-roles').split(',');
        
        if (allowedRoles.includes(userRole)) {
            button.style.display = 'flex'; // Mostrar botón
        } else {
            button.style.display = 'none'; // Ocultar botón
        }
    });
}

// Actualizar showSection para manejar las nuevas secciones
function showSection(section, event) {
    console.log('📄 Mostrando sección:', section);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.main-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remover clase active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.style.display = 'block';
        console.log('✅ Sección mostrada:', section + 'Section');
    } else {
        console.error('❌ No se encontró el elemento:', section + 'Section');
    }
    
    // Activar botón correspondiente
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Si no hay evento, activar el botón por defecto basado en la sección
        const defaultBtn = document.querySelector(`[onclick*="${section}"]`);
        if (defaultBtn) {
            defaultBtn.classList.add('active');
            console.log('✅ Botón activado:', defaultBtn);
        }
    }
    
    // Cargar datos según la sección
    switch(section) {
        case 'cartelera':
            console.log('🎬 Cargando películas...');
            cargarPeliculas();
            break;
        case 'perfil':
            cargarPerfil();
            break;
        case 'ventas':
            cargarVentas();
            break;
        case 'horarios':
            cargarHorariosAdmin();
            break;
        case 'usuarios':
            cargarUsuarios();
            break;
        case 'peliculas':
            cargarPeliculasAdmin();
            break;
        case 'salas':
            cargarSalas();
            break;
        case 'membresias':
            cargarMembresias();
            break;
        case 'membresiasCustomer':
            cargarMembresiasCustomer();
            break;
        default:
            console.log('ℹ️ Sección sin carga de datos especial:', section);
    }
}

// Funciones de Películas
async function cargarPeliculas() {
    console.log('🎬 Intentando cargar películas...');
    
    // Verificar que hay token antes de hacer peticiones
    const token = Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
    if (!token) {
        console.log('❌ No hay token para cargar películas');
        showNotification('No hay token de autenticación', 'error');
        return;
    }
    
    console.log('✅ Token encontrado, haciendo petición...');
    
    try {
        const response = await APIClient.get('/movies/all');
        const allMovies = response.movies || [];
        
        console.log('🎬 Películas cargadas:', allMovies.length);
        
        // Limitar a solo 8 películas para la cartelera
        movies = allMovies.slice(0, 8);
        mostrarPeliculas(movies);
        
        console.log('✅ Películas mostradas en la interfaz');
        
    } catch (error) {
        console.error('❌ Error al cargar películas:', error);
        showNotification('Error al cargar películas: ' + error.message, 'error');
        
        // Si es error de token, limpiar sesión
        if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
            console.log('🧹 Token inválido detectado, limpiando sesión...');
            Utils.storage.remove(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
            Utils.storage.remove(CONFIG.STORAGE.KEYS.CURRENT_USER);
            Utils.storage.remove(CONFIG.STORAGE.KEYS.REFRESH_TOKEN);
            currentUser = null;
            
            // Redirigir al login
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('navigation').style.display = 'none';
            showNotification('Sesión expirada. Por favor, inicia sesión nuevamente.', 'warning');
        }
    }
}

function mostrarPeliculas(moviesToShow) {
    const grid = document.getElementById('moviesGrid');
    
    if (!moviesToShow || moviesToShow.length === 0) {
        grid.innerHTML = '<div class="no-movies">No se encontraron películas</div>';
        return;
    }
    
    grid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card" onclick="mostrarDetallesPelicula(${movie.id})">
            <div class="movie-poster">
                <img src="${buildImageUrl(movie.poster_url, 'LARGE')}" 
                     alt="${movie.title}" 
                     onerror="this.src='https://via.placeholder.com/342x513?text=Sin+Imagen'">
                <div class="movie-overlay">
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.vote_average || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p class="movie-release">${formatDate(movie.release_date)}</p>
                <p class="movie-language">${movie.original_language?.toUpperCase() || 'ES'}</p>
            </div>
        </div>
    `).join('');
}

async function buscarPeliculas() {
    const searchTerm = document.getElementById('searchMovies').value.trim();
    
    if (!searchTerm) {
        mostrarPeliculas(movies);
        return;
    }
    
    // Búsqueda local sin llamadas a la API
    const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.original_title && movie.original_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.overview && movie.overview.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    mostrarPeliculas(filteredMovies);
}

async function mostrarDetallesPelicula(movieId) {
    try {
        const response = await APIClient.post('/movies/by_id', {
            movie_id: movieId
        });
        
        currentMovie = response.movie;
        
        // Poblar modal con información
        document.getElementById('modalMoviePoster').src = buildImageUrl(currentMovie.poster_url, 'XLARGE');
        document.getElementById('modalMovieTitle').textContent = currentMovie.title;
        document.getElementById('modalMovieRating').textContent = currentMovie.vote_average || 'N/A';
        document.getElementById('modalMovieDate').textContent = Utils.format.date(currentMovie.release_date);
        document.getElementById('modalMovieLanguage').textContent = currentMovie.original_language?.toUpperCase() || 'ES';
        document.getElementById('modalMovieOverview').textContent = currentMovie.overview || 'Sin descripción disponible';
        
        // Cargar géneros
        if (currentMovie.genres) {
            document.getElementById('modalMovieGenres').innerHTML = currentMovie.genres
                .map(genre => `<span class="genre-tag">${genre}</span>`)
                .join('');
        }
        
        // Mostrar modal con la clase active para centrarlo correctamente
        document.getElementById('movieModal').classList.add('active');
        
    } catch (error) {
        showNotification('Error al cargar detalles de la película', 'error');
    }
}

// Funciones de Horarios
async function verHorarios() {
    if (!currentMovie) return;
    
    try {
        const response = await APIClient.get('/showtimes/all');
        const allShowtimes = response.showtimes || [];
        
        // Filtrar horarios para la película actual
        const movieShowtimes = allShowtimes.filter(st => st.movie_id === currentMovie.id);
        
        if (movieShowtimes.length === 0) {
            document.getElementById('showtimesList').innerHTML = 
                '<div class="no-showtimes">No hay horarios disponibles para esta película</div>';
        } else {
            mostrarHorarios(movieShowtimes);
        }
        
        // Cerrar modal de película y abrir modal de horarios
        closeModal('movieModal');
        document.getElementById('scheduleModal').classList.add('active');
        
    } catch (error) {
        showNotification('Error al cargar horarios', 'error');
    }
}

function mostrarHorarios(showtimes) {
    const container = document.getElementById('showtimesList');
    
    console.log('Horarios recibidos:', showtimes); // Debug
    
    // Agrupar por fecha (extraer solo la fecha del datetime)
    const groupedByDate = showtimes.reduce((acc, showtime) => {
        const date = showtime.datetime.split('T')[0]; // Extraer solo la fecha del datetime
        if (!acc[date]) acc[date] = [];
        acc[date].push(showtime);
        return acc;
    }, {});
    
    container.innerHTML = Object.entries(groupedByDate).map(([date, times]) => `
        <div class="showtime-date-group">
            <h4>${Utils.format.date(date)}</h4>
            <div class="showtimes-row">
                ${times.map(showtime => `
                    <button class="showtime-btn" onclick="seleccionarHorario(${JSON.stringify(showtime).replace(/"/g, '&quot;')})">
                        ${Utils.format.time(showtime.datetime)}
                        <br>
                        <small>Sala #${showtime.theater_id}</small>
                        <br>
                        <small>${Utils.format.currency(showtime.base_price || 120)}</small>
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Funciones de Asientos
async function seleccionarHorario(showtime) {
    selectedShowtime = showtime;
    
    // Mostrar información del showtime seleccionado
    document.getElementById('selectedShowtimeInfo').innerHTML = `
        <h3>${currentMovie.title}</h3>
        <p>${formatDate(showtime.date)} - ${formatTime(showtime.time)}</p>
        <p>Sala ${showtime.theater_name || showtime.theater_id}</p>
        <p>Precio: ${formatCurrency(showtime.price || 120)}</p>
    `;
    
    // Cargar asientos
    await cargarAsientos();
    
    // Cerrar modal de horarios y abrir modal de asientos
    closeModal('scheduleModal');
    document.getElementById('seatsModal').classList.add('active');
}

async function cargarAsientos() {
    try {
        // Obtener asientos reservados para este showtime
        const response = await APIClient.get('/reserved_seats/all');
        const reservedSeats = response.reserved_seats || [];
        
        // Filtrar asientos reservados para este showtime específico
        // Necesitamos obtener las ventas para este showtime y luego los asientos reservados
        const salesResponse = await APIClient.get('/sales/all');
        const allSales = salesResponse.sales || [];
        const showtimeSales = allSales.filter(sale => sale.showtime_id === selectedShowtime.showtime_id);
        const saleIds = showtimeSales.map(sale => sale.sale_id);
        
        // Filtrar asientos reservados que pertenecen a ventas de este showtime
        const showtimeReservedSeats = reservedSeats.filter(seat => 
            saleIds.includes(seat.sale_id)
        );
        
        generarAsientos(showtimeReservedSeats);
        
    } catch (error) {
        showNotification('Error al cargar asientos', 'error');
        generarAsientos([]); // Generar asientos sin reservas
    }
}

function generarAsientos(reservedSeats = []) {
    const container = document.getElementById('seatsContainer');
    const rows = 8; // Filas A-H
    const seatsPerRow = 12; // 12 asientos por fila
    
    // Crear un Set con los asientos reservados usando el campo seat_number directamente
    const reservedSeatsSet = new Set(
        reservedSeats.map(seat => seat.seat_number)
    );
    
    let seatsHTML = '';
    
    for (let row = 0; row < rows; row++) {
        const rowLetter = String.fromCharCode(65 + row); // A, B, C, etc.
        
        // Añadir espacio después de la fila F (pasillo)
        if (row === 6) {
            seatsHTML += `<div class="seats-aisle"></div>`;
        }
        
        seatsHTML += `<div class="seats-row">`;
        seatsHTML += `<div class="row-label">${rowLetter}</div>`;
        
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            const seatId = `${rowLetter}${seat}`;
            const isReserved = reservedSeatsSet.has(seatId);
            
            // Añadir espacio en el medio para simular pasillo central
            if (seat === 7) {
                seatsHTML += `<div class="seat-spacer"></div>`;
            }
            
            seatsHTML += `
                <div class="seat ${isReserved ? 'occupied' : 'available'}" 
                     data-seat="${seatId}" 
                     onclick="${isReserved ? '' : 'toggleSeat(this)'}">
                    ${seat}
                </div>
            `;
        }
        
        seatsHTML += `</div>`;
    }
    
    container.innerHTML = seatsHTML;
    
    // Resetear selección
    selectedSeats = [];
    actualizarResumenCompra();
}

function toggleSeat(seatElement) {
    const seatId = seatElement.dataset.seat;
    
    if (seatElement.classList.contains('selected')) {
        // Deseleccionar
        seatElement.classList.remove('selected');
        selectedSeats = selectedSeats.filter(seat => seat !== seatId);
    } else {
        // Seleccionar (máximo 8 asientos)
        if (selectedSeats.length < 8) {
            seatElement.classList.add('selected');
            selectedSeats.push(seatId);
        } else {
            showNotification('Máximo 8 asientos por compra', 'error');
        }
    }
    
    actualizarResumenCompra();
}

function actualizarResumenCompra() {
    const selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
    const totalPrice = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBookingBtn');
    
    if (selectedSeats.length === 0) {
        selectedSeatsDisplay.textContent = 'Ninguno';
        totalPrice.textContent = '$0';
        confirmBtn.disabled = true;
    } else {
        selectedSeatsDisplay.textContent = selectedSeats.join(', ');
        const price = selectedShowtime.price || 120;
        totalPrice.textContent = formatCurrency(price * selectedSeats.length);
        confirmBtn.disabled = false;
    }
}

// Funciones de Compra
async function confirmarCompra() {
    if (selectedSeats.length === 0) {
        showNotification('Selecciona al menos un asiento', 'error');
        return;
    }
    
    try {
        const price = selectedShowtime.base_price || 120;
        const totalAmount = price * selectedSeats.length;
        
        // Crear venta con los campos correctos según la base de datos
        const saleResponse = await APIClient.post('/sales/create', {
            showtime_id: selectedShowtime.showtime_id,
            customer_user_id: currentUser.user_id,
            ticket_quantity: selectedSeats.length,
            subtotal: totalAmount,
            discount_amount: 0,
            total: totalAmount,
            payment_method: 'credit_card'
        });
        
        // Obtener el ID de la venta recién creada
        const salesListResponse = await APIClient.get('/sales/all');
        const allSales = salesListResponse.sales || [];
        
        // Encontrar la venta más reciente del usuario actual
        const userSales = allSales.filter(sale => 
            sale.customer_user_id === currentUser.user_id
        ).sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
        
        const saleId = userSales[0]?.sale_id;
        
        if (!saleId) {
            throw new Error('No se pudo obtener el ID de la venta');
        }
        
        // Reservar asientos
        for (const seatId of selectedSeats) {
            await APIClient.post('/reserved_seats/create', {
                sale_id: saleId,
                seat_number: seatId  // Enviar el asiento completo como "A5", "B12", etc.
            });
        }
        
        // Mostrar confirmación con opción de generar PDF
        mostrarConfirmacionCompra(saleId, totalAmount, selectedSeats);
        
    } catch (error) {
        console.error('Error detallado:', error);
        showNotification('Error al procesar la compra: ' + error.message, 'error');
    }
}

function mostrarConfirmacionCompra(saleId, totalAmount, seats) {
    const ticketInfo = document.getElementById('ticketInfo');
    
    // Formatear fecha y hora del showtime
    const showDate = selectedShowtime ? 
        (selectedShowtime.datetime ? 
            new Date(selectedShowtime.datetime).toLocaleDateString('es-ES') : 
            (selectedShowtime.date || 'Fecha no disponible')
        ) : 'Fecha no disponible';
    
    const showTime = selectedShowtime ? 
        (selectedShowtime.datetime ? 
            new Date(selectedShowtime.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
            (selectedShowtime.time || 'Hora no disponible')
        ) : 'Hora no disponible';
    
    ticketInfo.innerHTML = `
        <div class="ticket-item">
            <strong>Número de Venta:</strong> ${saleId}
        </div>
        <div class="ticket-item">
            <strong>Película:</strong> ${currentMovie?.title || 'No disponible'}
        </div>
        <div class="ticket-item">
            <strong>Fecha:</strong> ${showDate}
        </div>
        <div class="ticket-item">
            <strong>Hora:</strong> ${showTime}
        </div>
        <div class="ticket-item">
            <strong>Sala:</strong> ${selectedShowtime?.theater_name || `Sala ${selectedShowtime?.theater_id}` || 'No disponible'}
        </div>
        <div class="ticket-item">
            <strong>Asientos:</strong> ${seats.join(', ')}
        </div>
        <div class="ticket-item">
            <strong>Total Pagado:</strong> ${formatCurrency(totalAmount)}
        </div>
        <div class="ticket-actions" style="margin-top: 20px;">
            <button onclick="generarPDFTicketDirecto(${saleId}, ${totalAmount}, '${seats.join(', ')}')" 
                    class="btn btn-primary">
                <i class="fas fa-download"></i> Descargar Ticket PDF
            </button>
        </div>
    `;
    
    // Cerrar modal de asientos y mostrar confirmación
    closeModal('seatsModal');
    document.getElementById('confirmationModal').classList.add('active');
}

// Funciones de Perfil
async function cargarPerfil() {
    if (!currentUser) return;
    
    // Actualizar información básica
    document.getElementById('profileName').textContent = currentUser.username;
    document.getElementById('profileRole').textContent = 
        currentUser.role === 'admin' ? 'Administrador' : 
        currentUser.role === 'employee' ? 'Empleado' : 'Cliente';
    
    // Solo cargar estadísticas y historial para clientes
    if (currentUser.role === 'customer') {
        await cargarEstadisticasPerfil();
        await cargarHistorialCompras();
    } else {
        // Para admin y empleados, ocultar secciones de compras
        const statsSection = document.querySelector('.profile-stats');
        const historySection = document.querySelector('.purchase-history-section');
        if (statsSection) statsSection.style.display = 'none';
        if (historySection) historySection.style.display = 'none';
    }
}

async function cargarEstadisticasPerfil() {
    try {
        const response = await APIClient.get('/sales/all');
        const allSales = response.sales || [];
        
        // Filtrar ventas del usuario actual
        const userSales = allSales.filter(sale => sale.customer_user_id === currentUser.user_id);
        
        const totalTickets = userSales.reduce((sum, sale) => sum + (sale.ticket_quantity || 0), 0);
        const totalSpent = userSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        document.getElementById('totalTickets').textContent = totalTickets;
        document.getElementById('totalSpent').textContent = Utils.format.currency(totalSpent);
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarHistorialCompras() {
    try {
        // Cargar todos los datos necesarios de una vez
        const [salesResponse, showtimesResponse, moviesResponse, reservedSeatsResponse] = await Promise.all([
            APIClient.get('/sales/all'),
            APIClient.get('/showtimes/all'),
            APIClient.get('/movies/all'),
            APIClient.get('/reserved_seats/all')
        ]);
        
        const allSales = salesResponse.sales || [];
        const allShowtimes = showtimesResponse.showtimes || [];
        const allMovies = moviesResponse.movies || [];
        const allReservedSeats = reservedSeatsResponse.reserved_seats || [];
        
        // Filtrar ventas del usuario actual
        const userSales = allSales.filter(sale => sale.customer_user_id === currentUser.user_id);
        
        const historyContainer = document.getElementById('purchaseHistory');
        
        if (userSales.length === 0) {
            historyContainer.innerHTML = '<div class="no-history">No hay compras registradas</div>';
            return;
        }
        
        // Ordenar por fecha más reciente
        userSales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
        
        // Procesar información adicional para cada venta (sin más llamadas API)
        const salesWithDetails = userSales.map(sale => {
            // Encontrar showtime
            const showtime = allShowtimes.find(st => st.showtime_id === sale.showtime_id);
            
            // Encontrar película
            const movie = showtime ? allMovies.find(m => m.id === showtime.movie_id) : null;
            
            // Encontrar asientos reservados
            const saleSeats = allReservedSeats.filter(seat => seat.sale_id === sale.sale_id);
            
            return {
                ...sale,
                showtime,
                movie,
                seats: saleSeats
            };
        });
        
        historyContainer.innerHTML = salesWithDetails.map(sale => `
            <div class="history-item">
                <div class="history-header">
                    <span class="sale-id">#${sale.sale_id}</span>
                    <span class="sale-date">${Utils.format.date(sale.sale_date)}</span>
                </div>
                <div class="history-details">
                    <div class="sale-info">
                        <span class="movie-title">${sale.movie ? sale.movie.title : 'Película no disponible'}</span>
                        <span class="showtime-info">
                            ${sale.showtime ? (formatDate(sale.showtime.date) + ' - ' + formatTime(sale.showtime.time)) : 'Función no disponible'}
                        </span>
                        <span class="seats-info">
                            Asientos: ${sale.seats && sale.seats.length > 0 ? sale.seats.map(s => s.seat_number).join(', ') : 'N/A'}
                        </span>
                    </div>
                    <div class="sale-summary">
                        <span class="sale-amount">${Utils.format.currency(sale.total)}</span>
                        <span class="sale-tickets">${sale.ticket_quantity} boletos</span>
                        <button onclick="generarPDFHistorial(${sale.sale_id})" class="btn-small btn-primary">
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error al cargar historial:', error);
        document.getElementById('purchaseHistory').innerHTML = '<div class="no-history">Error al cargar el historial</div>';
    }
}

// Funciones de administración y roles
// === FUNCIONES DE ADMINISTRACIÓN Y ROLES ===

// === FUNCIONES DE GESTIÓN DE VENTAS ===
async function cargarVentas() {
    try {
        const response = await APIClient.get('/sales/all');
        const sales = response.sales || [];
        
        // Calcular estadísticas
        const today = new Date().toDateString();
        const ventasHoy = sales.filter(sale => 
            new Date(sale.sale_date).toDateString() === today
        );
        
        const totalVentasHoy = ventasHoy.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalBoletos = sales.length;
        
        // Actualizar estadísticas
        document.getElementById('ventasHoy').textContent = Utils.format.currency(totalVentasHoy);
        document.getElementById('boletosVendidos').textContent = totalBoletos;
        
        // Mostrar tabla de ventas
        mostrarTablaVentas(sales.slice(0, 20)); // Últimas 20 ventas
        
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        showNotification('Error al cargar ventas', 'error');
    }
}

function mostrarTablaVentas(sales) {
    const container = document.getElementById('ventasTable');
    
    if (!sales || sales.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-receipt"></i><p>No hay ventas registradas</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Horario ID</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Cantidad</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => `
                    <tr>
                        <td>#${sale.sale_id}</td>
                        <td>${sale.customer_user_id || 'N/A'}</td>
                        <td>#${sale.showtime_id}</td>
                        <td>${Utils.format.date(sale.sale_date)}</td>
                        <td>${Utils.format.currency(sale.total || 0)}</td>
                        <td>${sale.ticket_quantity || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Funciones de gestión de horarios
async function cargarHorariosAdmin() {
    try {
        const response = await APIClient.get('/showtimes/all');
        const showtimes = response.showtimes || [];
        
        mostrarTablaHorarios(showtimes);
        
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        showNotification('Error al cargar horarios', 'error');
    }
}

function mostrarTablaHorarios(showtimes) {
    const container = document.getElementById('horariosTable');
    
    if (!showtimes || showtimes.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-clock"></i><p>No hay horarios registrados</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Película ID</th>
                    <th>Sala ID</th>
                    <th>Fecha y Hora</th>
                    <th>Precio</th>
                    <th>Asientos Disponibles</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${showtimes.map(showtime => `
                    <tr>
                        <td>#${showtime.showtime_id}</td>
                        <td>#${showtime.movie_id}</td>
                        <td>#${showtime.theater_id}</td>
                        <td>${Utils.format.dateTime(showtime.datetime)}</td>
                        <td>${Utils.format.currency(showtime.base_price || 0)}</td>
                        <td>${showtime.available_seats}${showtime.is_3d ? ' (3D)' : ''}${showtime.is_imax ? ' (IMAX)' : ''}</td>
                        <td class="actions">
                            <button class="btn-small btn-edit" onclick="editarHorario(${showtime.showtime_id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="eliminarHorario(${showtime.showtime_id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Variables para manejo de horarios
let currentEditingHorarioId = null;

// Función para abrir modal de crear horario
async function abrirModalCrearHorario() {
    currentEditingHorarioId = null;
    document.getElementById('horarioModalTitle').innerHTML = '<i class="fas fa-clock"></i> Crear Horario';
    document.getElementById('horarioForm').reset();
    
    // Cargar películas y salas para los selects
    await cargarPeliculasParaHorario();
    await cargarSalasParaHorario();
    
    document.getElementById('horarioModal').classList.add('active');
}

// Función para cargar películas en el select
async function cargarPeliculasParaHorario() {
    try {
        const response = await APIClient.get('/movies/all');
        const movies = response.movies || [];
        
        const select = document.getElementById('horarioMovie');
        select.innerHTML = '<option value="">Seleccionar película...</option>';
        
        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar películas:', error);
        showNotification('Error al cargar películas', 'error');
    }
}

// Función para cargar salas en el select
async function cargarSalasParaHorario() {
    try {
        const response = await APIClient.get('/theaters/all');
        const theaters = response.theaters || [];
        
        const select = document.getElementById('horarioTheater');
        select.innerHTML = '<option value="">Seleccionar sala...</option>';
        
        theaters.forEach(theater => {
            const option = document.createElement('option');
            option.value = theater.theater_id;
            option.textContent = `${theater.name} (Capacidad: ${theater.capacity})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar salas:', error);
        showNotification('Error al cargar salas', 'error');
    }
}

// Función para editar horario
async function editarHorario(horarioId) {
    try {
        const response = await APIClient.post('/showtimes/by_id', { showtime_id: horarioId });
        const horario = response.showtime;
        
        if (!horario) {
            showNotification('Horario no encontrado', 'error');
            return;
        }
        
        currentEditingHorarioId = horarioId;
        document.getElementById('horarioModalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Horario';
        
        // Cargar películas y salas
        await cargarPeliculasParaHorario();
        await cargarSalasParaHorario();
        
        // Separar fecha y hora del datetime
        const datetime = new Date(horario.datetime);
        const fecha = datetime.toISOString().split('T')[0];
        const hora = datetime.toTimeString().slice(0, 5);
        
        // Llenar el formulario
        document.getElementById('horarioMovie').value = horario.movie_id;
        document.getElementById('horarioTheater').value = horario.theater_id;
        document.getElementById('horarioDate').value = fecha;
        document.getElementById('horarioTime').value = hora;
        document.getElementById('horarioPrice').value = horario.base_price;
        document.getElementById('horarioSeats').value = horario.available_seats;
        document.getElementById('horario3D').checked = horario.is_3d || false;
        document.getElementById('horarioIMAX').checked = horario.is_imax || false;
        
        document.getElementById('horarioModal').classList.add('active');
        
    } catch (error) {
        console.error('Error al cargar horario:', error);
        showNotification('Error al cargar horario', 'error');
    }
}

// Función para eliminar horario
async function eliminarHorario(horarioId) {
    showConfirmModal('¿Estás seguro de que deseas eliminar este horario?', async () => {
        try {
            await APIClient.delete('/showtimes/delete', { showtime_id: horarioId });
            showNotification('Horario eliminado correctamente', 'success');
            cargarHorariosAdmin(); // Recargar la tabla
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            showNotification('Error al eliminar horario', 'error');
        }
    });
}

// Event listener para el formulario de horarios
let horarioFormInitialized = false;

function initializeHorarioForm() {
    if (horarioFormInitialized) return; // Evitar doble inicialización
    
    const horarioForm = document.getElementById('horarioForm');
    if (horarioForm) {
        horarioForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation(); // Evitar propagación del evento
            
            // Verificar si ya se está procesando
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn.disabled) return;
            
            // Deshabilitar botón para evitar doble envío
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
            
            try {
                const movieId = document.getElementById('horarioMovie').value;
                const theaterId = document.getElementById('horarioTheater').value;
                const fecha = document.getElementById('horarioDate').value;
                const hora = document.getElementById('horarioTime').value;
                const precio = parseFloat(document.getElementById('horarioPrice').value);
                const asientos = parseInt(document.getElementById('horarioSeats').value);
                const is3D = document.getElementById('horario3D').checked;
                const isIMAX = document.getElementById('horarioIMAX').checked;
                
                if (!movieId || !theaterId || !fecha || !hora || !precio || !asientos) {
                    showNotification('Por favor completa todos los campos obligatorios', 'error');
                    return;
                }
                
                // Combinar fecha y hora en formato datetime
                const datetime = `${fecha} ${hora}:00`;
                
                const horarioData = {
                    movie_id: parseInt(movieId),
                    theater_id: parseInt(theaterId),
                    datetime: datetime,
                    base_price: precio,
                    available_seats: asientos,
                    is_3d: is3D,
                    is_imax: isIMAX,
                    created_by_user_id: currentUser.user_id
                };
                
                if (currentEditingHorarioId) {
                    // Actualizar horario existente
                    horarioData.showtime_id = currentEditingHorarioId;
                    await APIClient.put('/showtimes/update', horarioData);
                    showNotification('Horario actualizado correctamente', 'success');
                } else {
                    // Crear nuevo horario
                    await APIClient.post('/showtimes/create', horarioData);
                    showNotification('Horario creado correctamente', 'success');
                }
                
                closeModal('horarioModal');
                cargarHorariosAdmin(); // Recargar la tabla
                
            } catch (error) {
                console.error('Error al guardar horario:', error);
                const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
                showNotification(`Error al crear horario: ${errorMessage}`, 'error');
            } finally {
                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Horario';
            }
        });
        horarioFormInitialized = true;
    }
}

// Funciones auxiliares de UI
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Modal de confirmación
let confirmCallback = null;

function showConfirmModal(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirmDeleteModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmDeleteModal').classList.remove('active');
    confirmCallback = null;
}

function confirmDelete() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}

// Funciones de apertura de modales para salas y membresías
function abrirModalCrearSala() {
    document.getElementById('salaModalTitle').innerHTML = '<i class="fas fa-building"></i> Crear Sala';
    document.getElementById('salaForm').reset();
    
    // Limpiar campo oculto de ID
    document.getElementById('salaId').value = '';
    
    document.getElementById('salaModal').classList.add('active');
}

function abrirModalCrearMembresia() {
    document.getElementById('membresiaModalTitle').innerHTML = '<i class="fas fa-id-card"></i> Crear Membresía';
    document.getElementById('membresiaForm').reset();
    
    // Limpiar campo oculto de ID
    document.getElementById('membresiaId').value = '';
    
    document.getElementById('membresiaModal').classList.add('active');
}

function abrirModalCrearUsuario() {
    document.getElementById('usuarioModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Crear Usuario';
    document.getElementById('usuarioForm').reset();
    
    // Limpiar campo oculto de ID
    document.getElementById('usuarioId').value = '';
    
    document.getElementById('usuarioModal').classList.add('active');
}

function abrirModalCrearPelicula() {
    document.getElementById('peliculaModalTitle').innerHTML = '<i class="fas fa-film"></i> Crear Película';
    document.getElementById('peliculaForm').reset();
    
    // Limpiar campo oculto de ID
    document.getElementById('peliculaId').value = '';
    
    document.getElementById('peliculaModal').classList.add('active');
}

// Funciones de guardado para todos los CRUD
async function guardarUsuario(event) {
    event.preventDefault();
    
    const userId = document.getElementById('usuarioId').value;
    const userData = {
        username: document.getElementById('usuarioUsername').value.trim(),
        first_name: document.getElementById('usuarioFirstName').value.trim(),
        last_name: document.getElementById('usuarioLastName').value.trim(),
        phone: document.getElementById('usuarioPhone').value.trim(),
        role: document.getElementById('usuarioRole').value,
        password: document.getElementById('usuarioPassword').value.trim()
    };

    // Validar campos requeridos
    if (!userData.username || !userData.first_name || !userData.last_name || !userData.role) {
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
    }

    try {
        if (userId) {
            // Actualizar usuario existente
            const updateData = { user_id: parseInt(userId), ...userData };
            if (!userData.password) {
                delete updateData.password; // No enviar password vacío en updates
            }
            await APIClient.put('/users/update', updateData);
            showNotification('Usuario actualizado exitosamente', 'success');
        } else {
            // Crear nuevo usuario
            if (!userData.password) {
                showNotification('La contraseña es requerida para nuevos usuarios', 'error');
                return;
            }
            await APIClient.post('/users/create', userData);
            showNotification('Usuario creado exitosamente', 'success');
        }
        
        closeModal('usuarioModal');
        await cargarUsuarios();
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        showNotification('Error al guardar el usuario: ' + error.message, 'error');
    }
}

async function guardarPelicula(event) {
    event.preventDefault();
    
    const movieId = document.getElementById('peliculaId').value;
    const movieData = {
        title: document.getElementById('peliculaTitle').value.trim(),
        original_title: document.getElementById('peliculaOriginalTitle').value.trim(),
        original_language: document.getElementById('peliculaOriginalLanguage').value.trim() || 'es',
        overview: document.getElementById('peliculaOverview').value.trim(),
        release_date: document.getElementById('peliculaReleaseDate').value,
        popularity: parseFloat(document.getElementById('peliculaPopularity').value) || 1.0,
        vote_average: parseFloat(document.getElementById('peliculaVoteAverage').value) || 0.0,
        vote_count: parseInt(document.getElementById('peliculaVoteCount').value) || 0,
        poster_url: document.getElementById('peliculaPosterUrl').value.trim() || '',
        wallpaper_url: document.getElementById('peliculaWallpaperUrl').value.trim() || '',
        is_adult: document.getElementById('peliculaIsAdult').checked || false
    };

    // Validar campos requeridos
    if (!movieData.title || !movieData.original_title || !movieData.overview || !movieData.release_date) {
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
    }

    try {
        if (movieId) {
            // Actualizar película existente
            await APIClient.put('/movies/update', { movie_id: parseInt(movieId), ...movieData });
            showNotification('Película actualizada exitosamente', 'success');
        } else {
            // Crear nueva película
            await APIClient.post('/movies/create', movieData);
            showNotification('Película creada exitosamente', 'success');
        }
        
        closeModal('peliculaModal');
        await cargarPeliculasAdmin();
    } catch (error) {
        console.error('Error al guardar película:', error);
        showNotification('Error al guardar la película: ' + error.message, 'error');
    }
}

async function guardarSala(event) {
    event.preventDefault();
    
    const theaterId = document.getElementById('salaId').value;
    const theaterData = {
        name: document.getElementById('salaName').value.trim(),
        capacity: parseInt(document.getElementById('salaCapacity').value),
        has_3d: document.getElementById('salaHas3d').checked,
        has_dolby: document.getElementById('salaHasDolby').checked,
        is_imax: document.getElementById('salaIsImax').checked
    };

    // Validar campos requeridos
    if (!theaterData.name || !theaterData.capacity || theaterData.capacity < 1) {
        showNotification('Por favor, completa todos los campos requeridos correctamente', 'error');
        return;
    }

    try {
        if (theaterId) {
            // Actualizar sala existente
            await APIClient.put('/theaters/update', { theater_id: parseInt(theaterId), ...theaterData });
            showNotification('Sala actualizada exitosamente', 'success');
        } else {
            // Crear nueva sala
            await APIClient.post('/theaters/create', theaterData);
            showNotification('Sala creada exitosamente', 'success');
        }
        
        closeModal('salaModal');
        await cargarSalas();
    } catch (error) {
        console.error('Error al guardar sala:', error);
        showNotification('Error al guardar la sala: ' + error.message, 'error');
    }
}

async function guardarMembresia(event) {
    event.preventDefault();
    
    const membershipId = document.getElementById('membresiaId').value;
    const membershipData = {
        name: document.getElementById('membresiaName').value.trim(),
        description: document.getElementById('membresiaDescription').value.trim(),
        monthly_price: parseFloat(document.getElementById('membresiaPrice').value) || 0,
        discount_percentage: parseFloat(document.getElementById('membresiaDiscount').value) || 0,
        benefits: document.getElementById('membresiaBenefits').value.trim() || ''
    };

    // Validar campos requeridos
    if (!membershipData.name || !membershipData.description) {
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
    }

    if (membershipData.discount_percentage < 0 || membershipData.discount_percentage > 100) {
        showNotification('El descuento debe estar entre 0 y 100%', 'error');
        return;
    }

    try {
        if (membershipId) {
            // Actualizar membresía existente
            await APIClient.put('/memberships/update', { membership_id: parseInt(membershipId), ...membershipData });
            showNotification('Membresía actualizada exitosamente', 'success');
        } else {
            // Crear nueva membresía
            await APIClient.post('/memberships/create', membershipData);
            showNotification('Membresía creada exitosamente', 'success');
        }
        
        closeModal('membresiaModal');
        await cargarMembresias();
    } catch (error) {
        console.error('Error al guardar membresía:', error);
        showNotification('Error al guardar la membresía: ' + error.message, 'error');
    }
}

// === FUNCIONES DE MEMBRESÍAS PARA CUSTOMERS ===
async function cargarMembresiasCustomer() {
    try {
        console.log('🔄 Cargando membresías para customer...');
        console.log('🔍 Usuario actual:', Utils.storage.get(CONFIG.STORAGE.KEYS.CURRENT_USER));
        
        // Cargar membresía actual del usuario
        await cargarMembresiaActual();
        
        // Cargar membresías disponibles
        await cargarMembresiasDisponibles();
        
        console.log('✅ Membresías de customer cargadas correctamente');
    } catch (error) {
        console.error('❌ Error al cargar membresías de customer:', error);
        showNotification('Error al cargar las membresías', 'error');
    }
}

async function cargarMembresiaActual() {
    try {
        const currentUser = Utils.storage.get(CONFIG.STORAGE.KEYS.CURRENT_USER);
        if (!currentUser || !currentUser.user_id) {
            console.log('❌ No hay usuario actual para cargar membresía');
            mostrarSinMembresia();
            return;
        }

        console.log('🔄 Cargando membresía actual del usuario:', currentUser.user_id);
        
        const data = { user_id: currentUser.user_id };
        const response = await APIClient.post('/customer_memberships/by_user_id', data);
        
        if (response && response.customer_membership && response.membership) {
            console.log('✅ Membresía actual encontrada:', response);
            mostrarMembresiaActual(response);
        } else {
            console.log('ℹ️ Usuario sin membresía activa');
            mostrarSinMembresia();
        }
    } catch (error) {
        console.error('❌ Error al cargar membresía actual:', error);
        mostrarSinMembresia();
    }
}

async function cargarMembresiasDisponibles() {
    try {
        console.log('🔄 Cargando membresías disponibles...');
        console.log('🌐 Intentando endpoint: /memberships/all');
        
        const response = await APIClient.get('/memberships/all');
        console.log('📥 Respuesta recibida:', response);
        
        // Verificar si la respuesta tiene la propiedad memberships
        let membershipsArray = null;
        if (response && response.memberships && Array.isArray(response.memberships)) {
            membershipsArray = response.memberships;
            console.log('✅ Membresías encontradas en response.memberships:', membershipsArray.length);
        } else if (response && Array.isArray(response)) {
            membershipsArray = response;
            console.log('✅ Membresías encontradas directamente en response:', membershipsArray.length);
        }
        
        if (membershipsArray && membershipsArray.length > 0) {
            console.log('📋 Datos de membresías:', membershipsArray);
            mostrarMembresiasDisponibles(membershipsArray);
        } else {
            console.log('ℹ️ No hay membresías disponibles');
            console.log('🔍 Tipo de respuesta:', typeof response);
            console.log('🔍 Contenido de respuesta:', response);
            mostrarSinMembresiasDisponibles();
        }
    } catch (error) {
        console.error('❌ Error al cargar membresías disponibles:', error);
        console.log('🔄 Intentando con endpoint alternativo...');
        // Intentar con el endpoint alternativo
        try {
            const response2 = await APIClient.get('/memberships');
            console.log('📥 Respuesta endpoint alternativo:', response2);
            
            let membershipsArray2 = null;
            if (response2 && response2.memberships && Array.isArray(response2.memberships)) {
                membershipsArray2 = response2.memberships;
            } else if (response2 && Array.isArray(response2)) {
                membershipsArray2 = response2;
            }
            
            if (membershipsArray2 && membershipsArray2.length > 0) {
                console.log('✅ Membresías disponibles cargadas (endpoint alternativo):', membershipsArray2.length);
                mostrarMembresiasDisponibles(membershipsArray2);
            } else {
                console.log('❌ Endpoint alternativo tampoco funciona');
                mostrarSinMembresiasDisponibles();
            }
        } catch (error2) {
            console.error('❌ Error en endpoint alternativo:', error2);
            mostrarSinMembresiasDisponibles();
        }
    }
}

function mostrarMembresiaActual(data) {
    console.log('👑 Mostrando membresía actual:', data);
    const container = document.getElementById('currentMembershipCard');
    const customerMembership = data.customer_membership;
    const membership = data.membership;
    
    // Calcular días restantes
    const endDate = new Date(customerMembership.end_date);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // Generar beneficios basados en el tipo de membresía
    const getBenefits = (membershipName) => {
        const benefitsMap = {
            'Básica': [
                'Descuento del 5% en boletos',
                'Acceso a funciones matutinas',
                'Una palomita gratis mensual'
            ],
            'Premium': [
                'Descuento del 10% en boletos',
                'Reserva anticipada de asientos',
                'Palomitas y refresco gratis mensual',
                'Acceso a salas VIP'
            ],
            'VIP': [
                'Descuento del 15% en boletos',
                'Reserva exclusiva de asientos',
                'Combo completo gratis mensual',
                'Acceso prioritario a estrenos',
                'Estacionamiento gratuito'
            ],
            'Oro': [
                'Descuento del 20% en boletos',
                'Asientos premium reservados',
                'Combo premium gratis semanal',
                'Invitaciones a preestrenos',
                'Acceso a eventos especiales'
            ],
            'Platino': [
                'Descuento del 25% en boletos',
                'Butacas exclusivas de primera fila',
                'Alimentos y bebidas ilimitados',
                'Acceso VIP a todos los eventos',
                'Servicio de valet parking'
            ],
            'Diamante': [
                'Descuento del 30% en boletos',
                'Sala privada disponible',
                'Servicio de catering personalizado',
                'Acceso exclusivo a funciones privadas',
                'Concierge personal'
            ]
        };
        return benefitsMap[membershipName] || ['Beneficios exclusivos disponibles'];
    };
    
    const benefits = getBenefits(membership.name);
    
    const cardHTML = `
        <div class="current-membership-content">
            <div class="current-membership-main">
                <div class="current-membership-info">
                    <h4 class="current-membership-name">
                        <i class="fas fa-crown"></i> ${membership.name}
                    </h4>
                    <p class="current-membership-description">${membership.description}</p>
                    ${daysRemaining > 0 ? 
                        `<div class="days-remaining">
                            <i class="fas fa-calendar-alt"></i> 
                            <span>${daysRemaining} días restantes</span>
                        </div>` : 
                        `<div class="days-remaining expired">
                            <i class="fas fa-exclamation-triangle"></i> 
                            <span>Membresía expirada</span>
                        </div>`
                    }
                </div>
                <div class="current-membership-price">
                    ${membership.monthly_price || membership.price}
                </div>
            </div>
            
            <div class="current-membership-benefits">
                <h5><i class="fas fa-star"></i> Tus Beneficios Actuales</h5>
                <ul class="benefits-list">
                    ${benefits.map(benefit => `
                        <li><i class="fas fa-check-circle"></i> ${benefit}</li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="current-membership-details">
                <div class="membership-dates">
                    <span><strong>Fecha de inicio:</strong> ${new Date(customerMembership.start_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <span><strong>Fecha de fin:</strong> ${new Date(customerMembership.end_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
                
                <div class="membership-status">
                    <span class="status-badge ${customerMembership.is_active ? 'active' : 'inactive'}">
                        ${customerMembership.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                </div>
            </div>
            
            <div class="current-membership-actions">
                ${customerMembership.is_active ? 
                    `<button class="btn-cancel-membership" onclick="cancelarMembresia(${customerMembership.customer_membership_id})">
                        <i class="fas fa-times-circle"></i> Cancelar Membresía
                    </button>` : 
                    `<div class="membership-expired-message">
                        <i class="fas fa-info-circle"></i>
                        <span>Tu membresía ha expirado. ¡Renueva para seguir disfrutando de tus beneficios!</span>
                    </div>`
                }
            </div>
        </div>
    `;
    
    container.innerHTML = cardHTML;
}

function mostrarSinMembresia() {
    console.log('📝 Mostrando estado sin membresía');
    const container = document.getElementById('currentMembershipCard');
    
    const cardHTML = `
        <div class="no-membership-card">
            <div class="no-membership-content">
                <div class="no-membership-icon">
                    <i class="fas fa-gem"></i>
                </div>
                <h4>Sin Membresía Activa</h4>
                <p>Actualmente no tienes una membresía activa. ¡Descubre nuestros planes exclusivos y obtén beneficios increíbles!</p>
                <div class="no-membership-benefits">
                    <h5>¿Qué obtienes con una membresía?</h5>
                    <ul>
                        <li><i class="fas fa-percent"></i> Descuentos exclusivos en boletos</li>
                        <li><i class="fas fa-chair"></i> Reserva anticipada de asientos</li>
                        <li><i class="fas fa-gift"></i> Palomitas y bebidas gratis</li>
                        <li><i class="fas fa-vip"></i> Acceso a salas premium</li>
                    </ul>
                </div>
                <div class="no-membership-action">
                    <i class="fas fa-arrow-down"></i>
                    <span>Explora nuestras membresías disponibles abajo</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = cardHTML;
}

function mostrarMembresiasDisponibles(memberships) {
    console.log('🎨 Mostrando membresías disponibles:', memberships);
    const container = document.getElementById('availableMemberships');
    console.log('📦 Contenedor encontrado:', container);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor availableMemberships');
        return;
    }
    
    if (!memberships || memberships.length === 0) {
        console.log('📝 Mostrando mensaje de sin membresías');
        mostrarSinMembresiasDisponibles();
        return;
    }
    
    console.log('🔧 Generando HTML para', memberships.length, 'membresías');
    const cardsHTML = memberships.map(membership => {
        // Determinar si es membresía premium
        const isPremium = membership.name === 'Oro' || membership.name === 'Platino' || membership.name === 'Diamante';
        const cardClass = isPremium ? 'membership-card available premium' : 'membership-card available';
        
        return `
        <div class="${cardClass}">
            <div class="membership-header">
                <h4><i class="fas fa-gem"></i> ${membership.name}</h4>
                <span class="membership-price">$${membership.monthly_price}</span>
            </div>
            <div class="membership-body">
                <p class="membership-description">${membership.description}</p>
                <div class="membership-benefits">
                    <h5>Beneficios:</h5>
                    <ul>
                        <li><i class="fas fa-percentage"></i> ${membership.discount_percentage}% de descuento</li>
                        <li><i class="fas fa-star"></i> Acceso prioritario</li>
                        <li><i class="fas fa-crown"></i> Beneficios exclusivos</li>
                        ${isPremium ? '<li><i class="fas fa-vip"></i> Experiencia VIP</li>' : ''}
                    </ul>
                </div>
            </div>
            <div class="membership-actions">
                <button class="btn-primary" onclick="adquirirMembresia(${membership.membership_id}, '${membership.name}', ${membership.monthly_price})">
                    <i class="fas fa-shopping-cart"></i> Adquirir Membresía
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    console.log('🎨 HTML generado:', cardsHTML.substring(0, 200) + '...');
    container.innerHTML = cardsHTML;
    console.log('✅ HTML insertado en el contenedor');
}

function mostrarSinMembresiasDisponibles() {
    console.log('📝 Mostrando mensaje de sin membresías disponibles');
    const container = document.getElementById('availableMemberships');
    console.log('📦 Contenedor para mensaje:', container);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor availableMemberships para mensaje');
        return;
    }
    
    const messageHTML = `
        <div class="no-memberships-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>No hay membresías disponibles</h4>
            <p>Actualmente no hay membresías disponibles. Inténtalo más tarde.</p>
        </div>
    `;
    
    console.log('🎨 Insertando mensaje de no membresías');
    container.innerHTML = messageHTML;
    console.log('✅ Mensaje insertado correctamente');
}

async function adquirirMembresia(membershipId, membershipName, price) {
    try {
        const currentUser = Utils.storage.get(CONFIG.STORAGE.KEYS.CURRENT_USER);
        if (!currentUser || !currentUser.user_id) {
            showNotification('Error: No hay usuario activo', 'error');
            return;
        }

        mostrarConfirmacionCompra(
            'Adquirir Membresía',
            `¿Estás seguro de que deseas adquirir la membresía "${membershipName}"?`,
            price,
            async () => {
                console.log('🔄 Adquiriendo membresía:', { membershipId, userId: currentUser.user_id });

                // Agregar fechas automáticamente
                const startDate = new Date().toISOString().split('T')[0];
                const endDate = new Date();
                endDate.setFullYear(endDate.getFullYear() + 1);
                const endDateStr = endDate.toISOString().split('T')[0];

                const data = {
                    user_id: currentUser.user_id,
                    membership_id: membershipId,
                    start_date: startDate,
                    end_date: endDateStr,
                    is_active: true
                };

                try {
                    const response = await APIClient.post('/customer_memberships/create', data);
                    
                    if (response) {
                        console.log('✅ Membresía adquirida exitosamente:', response);
                        showNotification(`¡Membresía "${membershipName}" adquirida exitosamente!`, 'success');
                        
                        // Recargar las membresías para mostrar la nueva membresía activa
                        await cargarMembresiasCustomer();
                    }
                } catch (error) {
                    console.error('❌ Error al adquirir membresía:', error);
                    showNotification('Error al adquirir la membresía: ' + error.message, 'error');
                }
            }
        );
    } catch (error) {
        console.error('❌ Error al adquirir membresía:', error);
        showNotification('Error al adquirir la membresía: ' + error.message, 'error');
    }
}

async function cancelarMembresia(customerMembershipId) {
    try {
        mostrarConfirmacion(
            'Cancelar Membresía',
            '¿Estás seguro de que deseas cancelar tu membresía activa? Esta acción no se puede deshacer.',
            async () => {
                console.log('🔄 Cancelando membresía:', customerMembershipId);

                try {
                    const data = { customer_membership_id: customerMembershipId };
                    const response = await APIClient.delete('/customer_memberships/delete', data);
                    
                    if (response) {
                        console.log('✅ Membresía cancelada exitosamente');
                        showNotification('Membresía cancelada exitosamente', 'success');
                        
                        // Recargar las membresías para mostrar el estado actualizado
                        await cargarMembresiasCustomer();
                    }
                } catch (error) {
                    console.error('❌ Error al cancelar membresía:', error);
                    showNotification('Error al cancelar la membresía: ' + error.message, 'error');
                }
            }
        );
    } catch (error) {
        console.error('❌ Error al cancelar membresía:', error);
        showNotification('Error al cancelar la membresía: ' + error.message, 'error');
    }
}

// === FUNCIONES PARA MODALES PERSONALIZADOS ===

// Función auxiliar para remover modales existentes
function removeExistingModals() {
    const existingModals = document.querySelectorAll('.custom-modal-overlay');
    existingModals.forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
}

function mostrarConfirmacion(titulo, mensaje, onConfirm) {
    // Remover cualquier modal existente primero
    removeExistingModals();
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h3><i class="fas fa-question-circle"></i> ${titulo}</h3>
            </div>
            <div class="custom-modal-body">
                <p>${mensaje}</p>
            </div>
            <div class="custom-modal-footer">
                <button class="btn-secondary custom-modal-cancel">Cancelar</button>
                <button class="btn-danger custom-modal-confirm">Confirmar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Función para cerrar el modal de forma segura
    const closeModal = () => {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };
    
    // Eventos
    const cancelBtn = modal.querySelector('.custom-modal-cancel');
    const confirmBtn = modal.querySelector('.custom-modal-confirm');
    
    cancelBtn.onclick = closeModal;
    
    confirmBtn.onclick = () => {
        closeModal();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

function mostrarConfirmacionCompra(titulo, mensaje, precio, onConfirm) {
    // Remover cualquier modal existente primero
    removeExistingModals();
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h3><i class="fas fa-shopping-cart"></i> ${titulo}</h3>
            </div>
            <div class="custom-modal-body">
                <p>${mensaje}</p>
                <div class="precio-confirmacion">
                    <strong>Precio: $${precio}/mes</strong>
                </div>
            </div>
            <div class="custom-modal-footer">
                <button class="btn-secondary custom-modal-cancel">Cancelar</button>
                <button class="btn-primary custom-modal-confirm">
                    <i class="fas fa-credit-card"></i> Adquirir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Función para cerrar el modal de forma segura
    const closeModal = () => {
        if (modal && modal.parentNode) {
                      
            modal.parentNode.removeChild(modal);
        }
    };
    
    // Eventos
    const cancelBtn = modal.querySelector('.custom-modal-cancel');
    const confirmBtn = modal.querySelector('.custom-modal-confirm');
    
    cancelBtn.onclick = closeModal;
    
    confirmBtn.onclick = () => {
        closeModal();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Función para generar PDF directamente después de la compra (con datos actuales)
function generarPDFTicketDirecto(saleId, totalAmount, seatsString) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const primaryColor = [255, 82, 82];
        const textColor = [51, 51, 51];
        const backgroundColor = [245, 245, 245];
        
        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CINEMAX', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Vive la experiencia del cine moderno', 105, 30, { align: 'center' });
        
        // Título
        doc.setTextColor(...textColor);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET DE COMPRA', 105, 55, { align: 'center' });
        
        // Contenido
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let yPosition = 75;
        const lineHeight = 8;
        
        const showDate = selectedShowtime?.datetime ? 
            new Date(selectedShowtime.datetime).toLocaleDateString('es-ES') : 
            (selectedShowtime?.date || 'Fecha no disponible');
        
        const showTime = selectedShowtime?.datetime ? 
            new Date(selectedShowtime.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
            (selectedShowtime?.time || 'Hora no disponible');
        
        const ticketData = [
            ['Número de Venta:', `#${saleId}`],
            ['Cliente:', currentUser?.username || 'Cliente'],
            ['Película:', currentMovie?.title || 'Película no disponible'],
            ['Fecha de Función:', showDate],
            ['Hora de Función:', showTime],
            ['Sala:', selectedShowtime?.theater_name || `Sala ${selectedShowtime?.theater_id}` || 'Sala no disponible'],
            ['Asientos:', seatsString],
            ['Cantidad de Boletos:', (seatsString.split(', ').length).toString()],
            ['Total Pagado:', formatCurrency(totalAmount)]
        ];
        
        ticketData.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPosition);
            yPosition += lineHeight;
        });
        
        // Footer
        yPosition += 10;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 15;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Fecha de Compra: ' + new Date().toLocaleString('es-ES'), 20, yPosition);
        
        const fileName = `CINEMAX_Ticket_${saleId}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        showNotification('PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showNotification('Error al generar el PDF: ' + error.message, 'error');
    }
}

// Función para generar PDF desde el historial de compras
async function generarPDFHistorial(saleId) {
    try {
        // Obtener información detallada de la venta usando los endpoints
        const [salesResponse, showtimesResponse, moviesResponse, reservedSeatsResponse] = await Promise.all([
            APIClient.get('/sales/all'),
            APIClient.get('/showtimes/all'),
            APIClient.get('/movies/all'),
            APIClient.get('/reserved_seats/all')
        ]);
        
        const allSales = salesResponse.sales || [];
        const allShowtimes = showtimesResponse.showtimes || [];
        const allMovies = moviesResponse.movies || [];
        const allReservedSeats = reservedSeatsResponse.reserved_seats || [];
        
        const sale = allSales.find(s => s.sale_id === saleId);
        if (!sale) {
            showNotification('No se encontró la información de la venta', 'error');
            return;
        }
        
        const showtime = allShowtimes.find(st => st.showtime_id === sale.showtime_id);
        const movie = showtime ? allMovies.find(m => m.id === showtime.movie_id) : null;
        const saleSeats = allReservedSeats.filter(seat => seat.sale_id === saleId);
        const seatsString = saleSeats.map(s => s.seat_number).join(', ');
        
        // Generar PDF con la información
        generarPDFTicketCompleto(sale, movie, showtime, seatsString);
        
    } catch (error) {
        console.error('Error al generar PDF del historial:', error);
        showNotification('Error al generar el PDF: ' + error.message, 'error');
    }
}

// Función para generar PDF completo de la venta (historial)
function generarPDFTicketCompleto(sale, movie, showtime, seatsString) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const primaryColor = [255, 82, 82];
        const textColor = [51, 51, 51];
        const backgroundColor = [245, 245, 245];
        
        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CINEMAX', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Vive la experiencia del cine moderno', 105, 30, { align: 'center' });
        
        // Título
        doc.setTextColor(...textColor);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET DE COMPRA', 105, 55, { align: 'center' });
        
        // Contenido
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let yPosition = 75;
        const lineHeight = 8;
        
        const showDate = showtime?.datetime ? 
            new Date(showtime.datetime).toLocaleDateString('es-ES') : 
            (showtime?.date || 'Fecha no disponible');
        
        const showTime = showtime?.datetime ? 
            new Date(showtime.datetime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 
            (showtime?.time || 'Hora no disponible');
        
        const ticketData = [
            ['Número de Venta:', `#${sale.sale_id}`],
            ['Cliente:', currentUser?.username || 'Cliente'],
            ['Película:', movie?.title || 'Película no disponible'],
            ['Fecha de Función:', showDate],
            ['Hora de Función:', showTime],
            ['Sala:', showtime?.theater_name || `Sala ${showtime?.theater_id}` || 'Sala no disponible'],
            ['Asientos:', seatsString],
            ['Cantidad de Boletos:', (seatsString.split(', ').length).toString()],
            ['Subtotal:', formatCurrency(sale.subtotal)],
            ['Descuento:', formatCurrency(sale.discount_amount || 0)],
            ['Total Pagado:', formatCurrency(sale.total)]
        ];
        
        ticketData.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPosition);
            yPosition += lineHeight;
        });
        
        // Línea separadora
        yPosition += 10;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(20, yPosition, 190, yPosition);
        
        // Información adicional
        yPosition += 15;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Fecha de Compra: ' + new Date().toLocaleString('es-ES'), 20, yPosition);
        yPosition += 6;
        doc.text('Método de Pago: Tarjeta de Crédito', 20, yPosition);
        
        // Código QR simulado (rectángulo como placeholder)
        yPosition += 15;
        doc.setFillColor(200, 200, 200);
        doc.rect(20, yPosition, 25, 25, 'F');
        doc.setTextColor(...textColor);
        doc.setFontSize(8);
        doc.text('QR Code', 32.5, yPosition + 13, { align: 'center' });
        
        // Términos y condiciones
        yPosition += 35;
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        const terms = [
            '• Presente este ticket en taquilla para validar su entrada',
            '• Llegue 15 minutos antes del inicio de la función',
            '• No se permiten reembolsos una vez iniciada la función',
            '• Conserve este ticket durante toda la función'
        ];
        
        terms.forEach(term => {
            doc.text(term, 20, yPosition);
            yPosition += 5;
        });
        
        // Footer
        yPosition += 10;
        doc.setFillColor(...backgroundColor);
        doc.rect(0, yPosition, 210, 30, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('¡Gracias por elegir CINEMAX!', 105, yPosition + 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('Disfrute su película', 105, yPosition + 22, { align: 'center' });
        
        // Descargar el PDF
        const fileName = `CINEMAX_Ticket_${sale.sale_id}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        showNotification('PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showNotification('Error al generar el PDF: ' + error.message, 'error');
    }
}

// Event Listeners
// Inicializar la aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 CINEMAX: Sistema iniciado correctamente');
    
    // Verificar si hay sesión activa
    const token = Utils.storage.get(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
    const savedUser = Utils.storage.get(CONFIG.STORAGE.KEYS.CURRENT_USER);
    
    if (token && savedUser) {
        currentUser = savedUser;
        console.log('Usuario autenticado encontrado:', currentUser.username);
        showMainApp(true); // Forzar carga de cartelera también en sesión persistente
    } else {
        // Limpiar cualquier dato de sesión corrupto
        Utils.storage.remove(CONFIG.STORAGE.KEYS.AUTH_TOKEN);
        Utils.storage.remove(CONFIG.STORAGE.KEYS.REFRESH_TOKEN);
        Utils.storage.remove(CONFIG.STORAGE.KEYS.CURRENT_USER);
        
        // Mostrar login
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('navigation').style.display = 'none';
        console.log('Mostrando pantalla de login');
    }
    
    // Inicializar formularios
    initializeAllForms();
    
    // Manejar tecla Enter en el login
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                iniciarSesion();
            }
        });
    }
    
    // Prevenir envío accidental de formularios con Enter
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
            // Solo prevenir en campos que no sean de texto largo
            if (e.target.type !== 'textarea') {
                e.preventDefault();
            }
        }
    });
    
    console.log('Inicialización completada');
});

// Funciones para manejar errores de token
async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            return data.access_token;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        cerrarSesion();
        return null;
    }
}

// === EVENT LISTENERS PARA FORMULARIOS ADMINISTRATIVOS ===

// Inicialización de todos los formularios
// Inicialización de event listeners para formularios
function initializeAllForms() {
    // Evitar inicialización múltiple
    if (window.formsInitialized) return;
    window.formsInitialized = true;

    // Usuario Form
    const usuarioForm = document.getElementById('usuarioForm');
    if (usuarioForm && !usuarioForm.hasEventListener) {
        usuarioForm.addEventListener('submit', guardarUsuario);
        usuarioForm.hasEventListener = true;
    }

    // Película Form
    const peliculaForm = document.getElementById('peliculaForm');
    if (peliculaForm && !peliculaForm.hasEventListener) {
        peliculaForm.addEventListener('submit', guardarPelicula);
        peliculaForm.hasEventListener = true;
    }

    // Sala Form
    const salaForm = document.getElementById('salaForm');
    if (salaForm && !salaForm.hasEventListener) {
        salaForm.addEventListener('submit', guardarSala);
        salaForm.hasEventListener = true;
    }

    // Membresía Form
    const membresiaForm = document.getElementById('membresiaForm');
    if (membresiaForm && !membresiaForm.hasEventListener) {
        membresiaForm.addEventListener('submit', guardarMembresia);
        membresiaForm.hasEventListener = true;
    }

    // Inicializar formulario de horarios
    initializeHorarioForm();
}

// Funciones de gestión de usuarios
async function cargarUsuarios() {
    try {
        const response = await APIClient.get('/users/all?roles=all');
        console.log('Respuesta de usuarios:', response);
        
        const users = response.users || [];
        mostrarTablaUsuarios(users);
        
        // Actualizar estadísticas
        document.getElementById('totalUsuarios').textContent = users.length;
        document.getElementById('usuariosActivos').textContent = users.filter(u => u.is_active !== false).length;
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

function mostrarTablaUsuarios(users) {
    const container = document.getElementById('usuariosTable');
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-users"></i><p>No hay usuarios registrados</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>#${user.user_id}</td>
                        <td>${user.username}</td>
                        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                        <td><span class="status-badge ${user.is_active !== false ? 'active' : 'inactive'}">${user.is_active !== false ? 'Activo' : 'Inactivo'}</span></td>
                        <td>${Utils.format.date(user.created_at)}</td>
                        <td class="actions">
                            <button class="btn-small btn-edit" onclick="editarUsuario(${user.user_id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="eliminarUsuario(${user.user_id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Funciones CRUD de Usuarios
async function editarUsuario(userId) {
    try {
        // Como no hay un endpoint para obtener un usuario completo, 
        // vamos a obtener los campos uno por uno
        const fieldsToGet = ['username', 'first_name', 'last_name', 'role', 'phone'];
        const user = {};
        
        for (const field of fieldsToGet) {
            try {
                const response = await APIClient.post('/users/value_by_id', { 
                    user_id: userId,
                    column_name: field
                });
                user[field] = response[field];
            } catch (error) {
                console.warn(`No se pudo obtener el campo ${field}:`, error);
                user[field] = '';
            }
        }
        
        // Llenar el modal con los datos del usuario
        document.getElementById('usuarioModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuario';
        document.getElementById('usuarioUsername').value = user.username || '';
        document.getElementById('usuarioFirstName').value = user.first_name || '';
        document.getElementById('usuarioLastName').value = user.last_name || '';
        document.getElementById('usuarioPhone').value = user.phone || '';
        document.getElementById('usuarioRole').value = user.role || 'customer';
        document.getElementById('usuarioPassword').value = ''; // No mostrar password
        document.getElementById('usuarioPassword').placeholder = 'Dejar vacío para mantener contraseña actual';
        document.getElementById('usuarioPassword').required = false;
        
        // Establecer el ID para edición
        document.getElementById('usuarioId').value = userId;
        
        document.getElementById('usuarioModal').classList.add('active');
        
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        showNotification('Error al cargar los datos del usuario', 'error');
    }
}

async function eliminarUsuario(userId) {
    showConfirmModal('¿Estás seguro de que deseas eliminar este usuario?', async () => {
        try {
            console.log('Eliminando usuario con ID:', userId);
            await APIClient.delete('/users/delete', { user_id: parseInt(userId) });
            showNotification('Usuario eliminado exitosamente', 'success');
            await cargarUsuarios(); // Recargar la tabla
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showNotification('Error al eliminar el usuario: ' + error.message, 'error');
        }
    });
}

// Funciones de gestión de películas para admin
async function cargarPeliculasAdmin() {
    try {
        const response = await APIClient.get('/movies/all');
        const movies = response.movies || [];
        
        mostrarTablaPeliculasAdmin(movies);
        
    } catch (error) {
        console.error('Error al cargar películas admin:', error);
        showNotification('Error al cargar películas', 'error');
    }
}

function mostrarTablaPeliculasAdmin(movies) {
    const container = document.getElementById('peliculasAdminTable');
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-film"></i><p>No hay películas registradas</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Fecha Estreno</th>
                    <th>Calificación</th>
                    <th>Idioma</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${movies.map(movie => `
                    <tr>
                        <td>#${movie.id}</td>
                        <td>${movie.title}</td>
                        <td>${Utils.format.date(movie.release_date)}</td>
                        <td>${movie.vote_average || 'N/A'}</td>
                        <td>${movie.original_language?.toUpperCase() || 'ES'}</td>
                        <td class="actions">
                            <button class="btn-small btn-edit" onclick="editarPelicula(${movie.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="eliminarPelicula(${movie.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Funciones CRUD de Películas
async function editarPelicula(movieId) {
    try {
        const response = await APIClient.post('/movies/by_id', { movie_id: movieId });
        const movie = response.movie;
        
        if (movie) {
            // Llenar el modal con los datos de la película
            document.getElementById('peliculaModalTitle').innerHTML = '<i class="fas fa-film"></i> Editar Película';
            document.getElementById('peliculaTitle').value = movie.title || '';
            document.getElementById('peliculaOriginalTitle').value = movie.original_title || '';
            document.getElementById('peliculaOriginalLanguage').value = movie.original_language || 'es';
            document.getElementById('peliculaOverview').value = movie.overview || '';
            document.getElementById('peliculaReleaseDate').value = movie.release_date || '';
            document.getElementById('peliculaPopularity').value = movie.popularity || 1.0;
            document.getElementById('peliculaVoteAverage').value = movie.vote_average || 0.0;
            document.getElementById('peliculaVoteCount').value = movie.vote_count || 0;
            document.getElementById('peliculaPosterUrl').value = movie.poster_url || '';
            document.getElementById('peliculaWallpaperUrl').value = movie.wallpaper_url || '';
            document.getElementById('peliculaIsAdult').checked = movie.is_adult || false;
            
            // Establecer el ID para edición
            document.getElementById('peliculaId').value = movieId;
            
            document.getElementById('peliculaModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error al cargar película:', error);
        showNotification('Error al cargar los datos de la película', 'error');
    }
}

async function eliminarPelicula(movieId) {
    showConfirmModal('¿Estás seguro de que deseas eliminar esta película?', async () => {
        try {
            console.log('Eliminando película con ID:', movieId);
            await APIClient.delete('/movies/delete', { movie_id: parseInt(movieId) });
            showNotification('Película eliminada exitosamente', 'success');
            await cargarPeliculasAdmin(); // Recargar la tabla
        } catch (error) {
            console.error('Error al eliminar película:', error);
            showNotification('Error al eliminar la película: ' + error.message, 'error');
        }
    });
}

// Funciones CRUD de Salas
async function editarSala(theaterId) {
    try {
        const response = await APIClient.post('/theaters/by_id', { theater_id: theaterId });
        const theater = response.theater;
        
        if (theater) {
            // Llenar el modal con los datos de la sala
            document.getElementById('salaModalTitle').innerHTML = '<i class="fas fa-building"></i> Editar Sala';
            document.getElementById('salaName').value = theater.name || '';
            document.getElementById('salaCapacity').value = theater.capacity || '';
            document.getElementById('salaHas3d').checked = theater.has_3d || false;
            document.getElementById('salaHasDolby').checked = theater.has_dolby || false;
            document.getElementById('salaIsImax').checked = theater.is_imax || false;
            document.getElementById('salaId').value = theaterId;
            
            document.getElementById('salaModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error al cargar sala:', error);
        showNotification('Error al cargar los datos de la sala', 'error');
    }
}

async function eliminarSala(theaterId) {
    showConfirmModal('¿Estás seguro de que deseas eliminar esta sala?', async () => {
        try {
            await APIClient.delete('/theaters/delete', { theater_id: theaterId });
            showNotification('Sala eliminada exitosamente', 'success');
            await cargarSalas(); // Recargar la tabla
        } catch (error) {
            console.error('Error al eliminar sala:', error);
            showNotification('Error al eliminar la sala', 'error');
        }
    });
}

// Funciones CRUD de Membresías
async function editarMembresia(membershipId) {
    try {
        const response = await APIClient.post('/memberships/by_id', { membership_id: membershipId });
        const membership = response.membership;
        
        if (membership) {
            // Llenar el modal con los datos de la membresía
            document.getElementById('membresiaModalTitle').innerHTML = '<i class="fas fa-id-card"></i> Editar Membresía';
            document.getElementById('membresiaName').value = membership.name || '';
            document.getElementById('membresiaDescription').value = membership.description || '';
            document.getElementById('membresiaPrice').value = membership.monthly_price || '';
            document.getElementById('membresiaDiscount').value = membership.discount_percentage || '';
            document.getElementById('membresiaBenefits').value = membership.benefits || '';
            document.getElementById('membresiaId').value = membershipId;
            
            document.getElementById('membresiaModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error al cargar membresía:', error);
        showNotification('Error al cargar los datos de la membresía', 'error');
    }
}

async function eliminarMembresia(membershipId) {
    showConfirmModal('¿Estás seguro de que deseas eliminar esta membresía?', async () => {
        try {
            await APIClient.delete('/memberships/delete', { membership_id: membershipId });
            showNotification('Membresía eliminada exitosamente', 'success');
            await cargarMembresias(); // Recargar la tabla
        } catch (error) {
            console.error('Error al eliminar membresía:', error);
            showNotification('Error al eliminar la membresía', 'error');
        }
    });
}

// === FUNCIONES PARA ADMINISTRACIÓN DE SALAS ===

async function cargarSalas() {
    try {
        const response = await APIClient.get('/theaters/all');
        const theaters = response.theaters || [];
        
        mostrarTablaSalas(theaters);
        
    } catch (error) {
        console.error('Error al cargar salas:', error);
        showNotification('Error al cargar salas', 'error');
    }
}

function mostrarTablaSalas(theaters) {
    const container = document.getElementById('salasTable');
    
    if (!theaters || theaters.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-building"></i><p>No hay salas registradas</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Capacidad</th>
                    <th>Características</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${theaters.map(theater => `
                    <tr>
                        <td>#${theater.theater_id}</td>
                        <td>${theater.name}</td>
                        <td>${theater.capacity} asientos</td>
                        <td>
                            ${theater.has_3d ? '<span class="feature-badge">3D</span>' : ''}
                            ${theater.has_dolby ? '<span class="feature-badge">Dolby</span>' : ''}
                            ${theater.is_imax ? '<span class="feature-badge">IMAX</span>' : ''}
                        </td>
                        <td class="actions">
                            <button class="btn-small btn-edit" onclick="editarSala(${theater.theater_id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="eliminarSala(${theater.theater_id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// === FUNCIONES PARA ADMINISTRACIÓN DE MEMBRESÍAS ===

async function cargarMembresias() {
    try {
        const response = await APIClient.get('/memberships/all');
        const memberships = response.memberships || [];
        
        mostrarTablaMembresias(memberships);
        
    } catch (error) {
        console.error('Error al cargar membresías:', error);
        showNotification('Error al cargar membresías', 'error');
    }
}

function mostrarTablaMembresias(memberships) {
    const container = document.getElementById('membresiasTable');
    
    if (!memberships || memberships.length === 0) {
        container.innerHTML = '<div class="table-empty"><i class="fas fa-id-card"></i><p>No hay membresías registradas</p></div>';
        return;
    }
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descuento</th>
                    <th>Precio Mensual</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${memberships.map(membership => `
                    <tr>
                        <td>#${membership.membership_id}</td>
                        <td><strong>${membership.name}</strong></td>
                        <td>${membership.discount_percentage}%</td>
                        <td>$${membership.monthly_price}</td>
                        <td>${membership.description}</td>
                        <td class="actions">
                            <button class="btn-small btn-edit" onclick="editarMembresia(${membership.membership_id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-small btn-delete" onclick="eliminarMembresia(${membership.membership_id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Función para generar PDF del ticket de compra
function generarPDFTicket(saleId, totalAmount, seatsString) {
    try {
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurar colores y fuentes
        const primaryColor = [255, 82, 82]; // Color rojo del tema #ff5252
        const textColor = [51, 51, 51]; // Color gris oscuro
        const backgroundColor = [245, 245, 245]; // Gris claro
        
        // Título del documento
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F'); // Header rojo
        
        doc.setTextColor(255, 255, 255); // Texto blanco
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CINEMAX', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Vive la experiencia del cine moderno', 105, 30, { align: 'center' });
        
        // Título del ticket
        doc.setTextColor(...textColor);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('TICKET DE COMPRA', 105, 55, { align: 'center' });
        
        // Información del ticket
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        let yPosition = 75;
        const lineHeight = 8;
        
        // Información de la compra
        const ticketData = [
            ['Número de Venta:', `#${saleId}`],
            ['Cliente:', currentUser.username || 'Cliente'],
            ['Película:', currentMovie.title || 'N/A'],
            ['Fecha de Función:', formatDate(selectedShowtime.date) || 'N/A'],
            ['Hora de Función:', formatTime(selectedShowtime.time) || 'N/A'],
            ['Sala:', selectedShowtime.theater_name || selectedShowtime.theater_id],
            ['Asientos:', seatsString],
            ['Cantidad de Boletos:', (seatsString.split(', ').length).toString()],
            ['Subtotal:', formatCurrency(sale.subtotal)],
            ['Descuento:', formatCurrency(sale.discount_amount || 0)],
            ['Total Pagado:', formatCurrency(sale.total)]
        ];
        
        // Dibujar información en el PDF
        ticketData.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPosition);
            yPosition += lineHeight;
        });
        
        // Línea separadora
        yPosition += 10;
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(1);
        doc.line(20, yPosition, 190, yPosition);
        
        // Información adicional
        yPosition += 15;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Fecha de Compra: ' + new Date().toLocaleString('es-ES'), 20, yPosition);
        yPosition += 6;
        doc.text('Método de Pago: Tarjeta de Crédito', 20, yPosition);
        
        // Código QR simulado (rectángulo como placeholder)
        yPosition += 15;
        doc.setFillColor(200, 200, 200);
        doc.rect(20, yPosition, 25, 25, 'F');
        doc.setTextColor(...textColor);
        doc.setFontSize(8);
        doc.text('QR Code', 32.5, yPosition + 13, { align: 'center' });
        
        // Términos y condiciones
        yPosition += 35;
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        const terms = [
            '• Presente este ticket en taquilla para validar su entrada',
            '• Llegue 15 minutos antes del inicio de la función',
            '• No se permiten reembolsos una vez iniciada la función',
            '• Conserve este ticket durante toda la función'
        ];
        
        terms.forEach(term => {
            doc.text(term, 20, yPosition);
            yPosition += 5;
        });
        
        // Footer
        yPosition += 10;
        doc.setFillColor(...backgroundColor);
        doc.rect(0, yPosition, 210, 30, 'F');
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('¡Gracias por elegir CINEMAX!', 105, yPosition + 15, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text('Disfrute su película', 105, yPosition + 22, { align: 'center' });
        
        // Generar nombre del archivo
        const fileName = `CINEMAX_Ticket_${saleId}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Descargar el PDF
        doc.save(fileName);
        
        showNotification('PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showNotification('Error al generar el PDF: ' + error.message, 'error');
    }
}
