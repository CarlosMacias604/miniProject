# 🎬 CINEMAX - Sistema de Cine Moderno

## Descripción
CINEMAX es un sistema completo de gestión de cine que incluye:
- **Backend**: API REST con FastAPI + MySQL
- **Frontend**: Interfaz web moderna y responsiva
- **Integración**: Con imágenes de TMDB (The Movie Database)

## 🚀 Características Principales

### Frontend
- ✨ **Diseño Moderno**: Interfaz premium con gradientes y animaciones
- 📱 **Responsive**: Adaptado para móviles y tablets
- 🎯 **Funcional**: Cartelera, horarios, selección de asientos, compras
- 🖼️ **Imágenes TMDB**: Posters de películas de alta calidad
- 🔐 **Autenticación**: Login/logout con JWT tokens
- 📊 **Perfil de Usuario**: Historial de compras y estadísticas

### Backend (API)
- 🔒 **Autenticación**: JWT tokens con roles (admin, employee, customer)
- 🎬 **Películas**: CRUD completo con integración TMDB
- 🎫 **Horarios**: Gestión de funciones por sala y película
- 💺 **Asientos**: Sistema de reservas en tiempo real
- 💳 **Ventas**: Procesamiento de compras y tickets
- 👥 **Usuarios**: Gestión de clientes y membresías

## 🛠️ Instalación y Uso

### Iniciar el Backend
```bash
cd miniProject
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Usar el Frontend
1. Abrir `frontend/index.html` en tu navegador web
2. Usar credenciales de usuario de la base de datos
3. Explorar la cartelera y realizar compras

## 🎨 Integración con TMDB

El sistema construye automáticamente las URLs de imágenes usando:
- **Base URL**: `https://image.tmdb.org/t/p/`
- **Tamaños**: w92, w154, w185, w342, w500, w780, original

```javascript
// Ejemplo en el frontend
const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_url}`;
```

## 🎯 Funcionalidades Implementadas

✅ **Autenticación JWT**  
✅ **Cartelera de películas con imágenes TMDB**  
✅ **Búsqueda de películas**  
✅ **Detalles de películas con géneros y ratings**  
✅ **Horarios por película y sala**  
✅ **Selección de asientos interactiva**  
✅ **Sistema de compras y boletos digitales**  
✅ **Perfil de usuario con historial**  
✅ **Diseño responsivo y moderno**  
✅ **Notificaciones en tiempo real**  
✅ **Estados de carga y manejo de errores**  

---

**Desarrollado con ❤️ para la mejor experiencia cinematográfica**