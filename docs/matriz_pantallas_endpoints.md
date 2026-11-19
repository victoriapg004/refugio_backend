# Matriz de pantallas y endpoints

Cada acción de la interfaz React y la ruta REST del backend con la que se comunica.

## Adoptantes

- Lista, ver el listado de adoptantes: GET `/api/adoptantes/`. Este es publico.
- Formulario nuevo, crear un adoptante: POST `/api/adoptantes/`. Pueden operador y administrador.
- Formulario editar, cargar los datos del adoptante: GET `/api/adoptantes/<id>/`. Este es publico.
- Formulario editar, guardar los cambios: PUT `/api/adoptantes/<id>/`. Pueden operador y administrador.
- Lista, eliminar un adoptante: DELETE `/api/adoptantes/<id>/`. Solo el administrador.

| Login | `/login` | `/api/token/` y `/api/perfil/` | POST y GET | Cualquiera |
| Dashboard | `/` | `/api/estadisticas/` | GET | Usuarios autenticados |
| Lista de mascotas | `/mascotas` | `/api/mascotas/` (`especie`, `estado`, `buscar`, `orden`, `pagina`) | GET | Todos los perfiles |
| Nueva mascota | `/mascotas/nueva` | `/api/mascotas/` | POST | Administrador y operador |
| Editar mascota | `/mascotas/:id/editar` | `/api/mascotas/{id}/` | GET y PUT | Administrador y operador |
| Eliminar mascota | `/mascotas` | `/api/mascotas/{id}/` | DELETE | Solo administrador |