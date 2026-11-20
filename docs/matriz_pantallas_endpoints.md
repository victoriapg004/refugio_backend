# Matriz de pantallas y endpoints

Cada acción de la interfaz React y la ruta REST del backend con la que se comunica.

## Login

- Pantalla de login (`/login`), iniciar sesión: POST `/api/token/`. Luego se consulta el perfil con GET `/api/perfil/` para conocer el rol. Puede entrar cualquiera.

## Dashboard

- Dashboard (`/`), mostrar las estadísticas: GET `/api/estadisticas/`. Usuarios autenticados.

## Mascotas

- Lista (`/mascotas`), ver el listado con los filtros `especie`, `estado`, `buscar`, `orden` y `pagina`: GET `/api/mascotas/`. Todos los perfiles.
- Formulario nueva (`/mascotas/nueva`), crear una mascota: POST `/api/mascotas/`. Pueden administrador y operador.
- Formulario editar (`/mascotas/:id/editar`), cargar los datos y guardar los cambios: GET y PUT `/api/mascotas/{id}/`. Pueden administrador y operador.
- Lista (`/mascotas`), eliminar una mascota: DELETE `/api/mascotas/{id}/`. Solo el administrador.

## Adoptantes

- Lista (`/adoptantes`), ver el listado de adoptantes: GET `/api/adoptantes/`. Es público.
- Formulario nuevo (`/adoptantes/nueva`), crear un adoptante: POST `/api/adoptantes/`. Pueden operador y administrador.
- Formulario editar (`/adoptantes/:id/editar`), cargar los datos del adoptante: GET `/api/adoptantes/<id>/`. Es público.
- Formulario editar (`/adoptantes/:id/editar`), guardar los cambios: PUT `/api/adoptantes/<id>/`. Pueden operador y administrador.
- Lista (`/adoptantes`), eliminar un adoptante: DELETE `/api/adoptantes/<id>/`. Solo el administrador.