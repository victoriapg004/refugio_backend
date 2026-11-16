# Matriz de pantallas y endpoints

Cada acción de la interfaz React y la ruta REST del backend con la que se comunica.

## Adoptantes

- Lista, ver el listado de adoptantes: GET `/api/adoptantes/`. Este es publico.
- Formulario nuevo, crear un adoptante: POST `/api/adoptantes/`. Pueden operador y administrador.
- Formulario editar, cargar los datos del adoptante: GET `/api/adoptantes/<id>/`. Este es publico.
- Formulario editar, guardar los cambios: PUT `/api/adoptantes/<id>/`. Pueden operador y administrador.
- Lista, eliminar un adoptante: DELETE `/api/adoptantes/<id>/`. Solo el administrador.