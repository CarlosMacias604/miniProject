# CINEMAX - Sistema de Gestión de Cine

## Descripción
Sistema completo de gestión de cine con backend FastAPI y frontend HTML/CSS/JavaScript que permite:
- 🎬 Gestión de cartelera de películas
- 🎫 Compra de boletos online
- 🪑 Selección de asientos interactiva
- 👥 Sistema de autenticación de usuarios
- 📊 Perfil de usuario y historial de compras

## Estructura del Proyecto

```
miniProject/
├── api/                    # Backend FastAPI
│   ├── main.py            # Punto de entrada de la API
│   ├── controllers/       # Lógica de negocio
│   ├── routes/           # Definición de rutas
│   ├── database/         # Conexión y operaciones de BD
│   └── helpers/          # Utilidades (hash, tokens, etc.)
├── frontend/             # Frontend web
│   ├── index.html       # Página principal
│   ├── estilos.css      # Estilos CSS
│   └── script.js        # Lógica JavaScript
└── storage/             # Base de datos MySQL
```

## Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido para Python
- **MySQL**: Base de datos relacional
- **JWT**: Autenticación con tokens
- **bcrypt**: Hashing de contraseñas

### Frontend
- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos modernos con gradientes y animaciones
- **JavaScript ES6+**: Lógica del cliente
- **Font Awesome**: Iconografía
- **TMDB API**: Imágenes de películas

## Configuración e Instalación

### Prerrequisitos
- Python 3.8+
- MySQL 8.0+
- Docker y Docker Compose (opcional)

### Instalación con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd miniProject
   ```

2. **Ejecutar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost:5500
   - API: http://localhost:8000
   - Documentación API: http://localhost:8000/docs

### Instalación Manual

#### Backend
1. **Crear entorno virtual**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. **Instalar dependencias**
   ```bash
   pip install fastapi uvicorn mysql-connector-python python-jose[cryptography] passlib[bcrypt] python-multipart
   ```

3. **Configurar variables de entorno**
   ```bash
   export MYSQL_HOST=localhost
   export MYSQL_USER=root
   export MYSQL_PASSWORD=root
   export MYSQL_DATABASE=cine
   ```

4. **Ejecutar servidor**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend
1. **Servir archivos estáticos**
   - Usar Live Server en VS Code
   - O cualquier servidor HTTP local en puerto 5500

#### Base de Datos
1. **Configurar MySQL**
   - Crear base de datos `cine`
   - Ejecutar scripts SQL de creación de tablas
   - Insertar datos de prueba

## Funcionalidades Principales

### 🔐 Autenticación
- Login de usuarios con JWT
- Sesiones persistentes
- Logout seguro
- Refresh tokens

### 🎬 Gestión de Películas
- Visualización de cartelera
- Búsqueda de películas
- Detalles de película con información completa
- Integración con TMDB para imágenes

### 🎫 Sistema de Reservas
- Visualización de horarios disponibles
- Selección interactiva de asientos
- Confirmación de compra
- Generación de boletos digitales

### 👤 Perfil de Usuario
- Estadísticas personales
- Historial de compras
- Información de cuenta

## API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar token

### Películas
- `POST /movies/all` - Obtener todas las películas
- `POST /movies/by_id` - Obtener película por ID
- `POST /movies/search` - Buscar películas

### Horarios
- `POST /showtimes/all` - Obtener todos los horarios
- `POST /showtimes/by_id` - Obtener horario por ID

### Ventas
- `POST /sales/all` - Obtener todas las ventas
- `POST /sales/create` - Crear nueva venta

### Asientos Reservados
- `POST /reserved_seats/all` - Obtener asientos reservados
- `POST /reserved_seats/create` - Reservar asiento

## Configuración de Imágenes

El sistema utiliza TMDB (The Movie Database) para las imágenes de películas:

### URL Base
```
https://image.tmdb.org/t/p/
```

### Tamaños Disponibles
- **Posters**: w92, w154, w185, w342, w500, w780, original
- **Backdrops**: w300, w780, w1280, original
- **Perfiles**: w45, w185, h632, original

### Uso en el Sistema
```javascript
// Ejemplo para poster de 500px de ancho
const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_url}`;
```

## Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `movies` - Información de películas
- `theaters` - Salas de cine
- `showtimes` - Horarios de funciones
- `sales` - Registro de ventas
- `reserved_seats` - Asientos reservados
- `memberships` - Tipos de membresía
- `customer_memberships` - Membresías de clientes

## Desarrollo

### Estructura del Frontend
```javascript
// Configuración principal
const API_BASE_URL = 'http://localhost:8000';
const TMDB_BASE_URL = 'https://image.tmdb.org/t/p/';

// Clases principales
class APIClient      // Manejo de peticiones HTTP
```

### Funciones Principales
- `iniciarSesion()` - Autenticación de usuario
- `cargarPeliculas()` - Carga de cartelera
- `mostrarDetallesPelicula()` - Modal de detalles
- `verHorarios()` - Selección de horarios
- `seleccionarHorario()` - Reserva de asientos
- `confirmarCompra()` - Procesamiento de venta

## Responsive Design
El frontend está optimizado para:
- 📱 Dispositivos móviles (768px y menor)
- 💻 Tablets y laptops
- 🖥️ Pantallas de escritorio

## Seguridad
- Autenticación JWT
- Validación de tokens
- Sanitización de datos
- CORS configurado
- Headers de seguridad

## Contribución
1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para detalles.

## Soporte
Para soporte y preguntas, crear un issue en el repositorio del proyecto.

---
**CINEMAX** - Vive la experiencia del cine moderno 🎬✨
