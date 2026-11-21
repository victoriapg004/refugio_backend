Frontend: Refugio de mascotas y adopciones
Aplicación React (Vite) con React Router, Axios y Bootstrap 5 que consume la API REST del backend Django de este mismo repositorio.

Las instrucciones completas de instalación, ejecución, configuración CORS, usuarios de prueba y limitaciones se encuentran en el README de la raíz del repositorio (../README.md).
Ejecución rápida
Con el backend ya en ejecución, desde la carpeta frontend:
npm install
Copy-Item .env.example .env
npm run dev
Abre http://localhost:5173 e inicia sesión con uno de los usuarios de prueba.
Estructura
- src/api/: cliente.js (Axios, URL base y token) y un archivo por módulo.
- src/components/: Layout, RutaProtegida, Alerta, Cargando, EstadoVacio, ModalConfirmar, Paginacion y Logo.
- src/context/: AuthContext.jsx (sesión compartida: login, logout y perfil).
- src/hooks/: usePermisos.js (acciones visibles según el perfil).
- src/pages/: Dashboard, Login y una carpeta por módulo (mascotas, adoptantes, solicitudes, visitas y salud).
- src/utils/: errores.js (mensajes para 400, 401, 403, 404, 409 y fallos de red) y estadosSolicitud.js.