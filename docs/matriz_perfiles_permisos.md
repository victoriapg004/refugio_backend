# Matriz de perfiles y permisos

Los perfiles se calculan así: `is_staff` es administrador, el grupo `Operador` es operador y el resto es consulta. El frontend oculta los botones con `usePermisos()`, pero la seguridad real está en Django (`config/permisos.py`).

## Interfaz

| Acción | Administrador | Operador | Consulta |
|---|---|---|---|
| Iniciar sesión | Sí | Sí | Sí |
| Ver Dashboard y listas | Sí | Sí | Sí |
| Crear (botón "Nueva mascota") | Sí | Sí | No se muestra |
| Editar (botón "Editar") | Sí | Sí | No se muestra |
| Eliminar (botón "Eliminar") | Sí | No se muestra | No se muestra |

## API

| Método | Administrador | Operador | Consulta | Sin token |
|---|---|---|---|---|
| GET | 200 | 200 | 200 | 200 |
| POST | 201 | 201 | 403 | 401 |
| PUT / PATCH | 200 | 200 | 403 | 401 |
| DELETE | 204 | 403 | 403 | 401 |

Notas:
- `GET /api/perfil/` y `GET /api/estadisticas/` exigen token; sin él responden 401.
- 401: no hay sesión o el token no es válido. El frontend borra la sesión y manda a `/login`.
- 403: hay sesión pero el perfil no tiene permiso. El frontend muestra "No tiene permiso para esta acción".
- 409: se intenta eliminar un registro con datos relacionados (una mascota con solicitudes o registros de vacunación).
- Un GET es libre en la API (no pide token), pero el frontend sí exige sesión para entrar a cualquier pantalla.