# Matriz de pantallas y endpoints

Cada acción de la interfaz React y la ruta REST del backend con la que se comunica. Todas las llamadas usan la URL base `VITE_API_URL` desde `frontend/src/api/cliente.js`, que adjunta `Authorization: Token …` cuando hay sesión.

Columna **Perfiles**: quién puede ejecutar la acción en la API. Los GET son públicos en el backend, pero el frontend exige sesión para entrar a cualquier pantalla.

## Login y sesión

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Login (`/login`) | Iniciar sesión | POST | `/api/token/` | Cualquiera |
| Login (`/login`) | Consultar el rol y los permisos del usuario | GET | `/api/perfil/` | Autenticados |
| Barra superior | Cerrar sesión (borra el token local, sin llamada a la API) | — | — | Autenticados |

## Dashboard

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Dashboard (`/`) | Mostrar indicadores y accesos a los cinco módulos | GET | `/api/estadisticas/` | Autenticados |

## Mascotas

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/mascotas`) | Listar con `especie`, `estado`, `buscar`, `orden` y `pagina` | GET | `/api/mascotas/` | Todos |
| Nueva (`/mascotas/nueva`) | Crear una mascota | POST | `/api/mascotas/` | Administrador, Operador |
| Editar (`/mascotas/:id/editar`) | Cargar los datos | GET | `/api/mascotas/{id}/` | Todos |
| Editar (`/mascotas/:id/editar`) | Guardar los cambios | PUT | `/api/mascotas/{id}/` | Administrador, Operador |
| Lista (`/mascotas`) | Eliminar (409 si tiene solicitudes o vacunas) | DELETE | `/api/mascotas/{id}/` | Administrador |

## Adoptantes

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/adoptantes`) | Listar adoptantes | GET | `/api/adoptantes/` | Todos |
| Nuevo (`/adoptantes/nueva`) | Crear un adoptante | POST | `/api/adoptantes/` | Administrador, Operador |
| Editar (`/adoptantes/:id/editar`) | Cargar los datos | GET | `/api/adoptantes/{id}/` | Todos |
| Editar (`/adoptantes/:id/editar`) | Guardar los cambios | PUT | `/api/adoptantes/{id}/` | Administrador, Operador |
| Lista (`/adoptantes`) | Eliminar un adoptante | DELETE | `/api/adoptantes/{id}/` | Administrador |

## Solicitudes

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/solicitudes`) | Listar con `estado`, `adoptante`, `mascota` y `pagina` | GET | `/api/solicitudes/` | Todos |
| Lista (`/solicitudes`) | Llenar el filtro de mascotas y el diccionario id → nombre | GET | `/api/mascotas/?todos=1` | Todos |
| Lista (`/solicitudes`) | Llenar el filtro de adoptantes y el diccionario id → nombre | GET | `/api/adoptantes/` | Todos |
| Lista y detalle | Aprobar (R2: visita realizada; R3: una aprobada por mascota; R10: la mascota pasa a adoptada) | PATCH | `/api/solicitudes/{id}/` con `{"estado": "aprobada"}` | Administrador, Operador |
| Lista y detalle | Rechazar | PATCH | `/api/solicitudes/{id}/` con `{"estado": "rechazada"}` | Administrador, Operador |
| Lista (`/solicitudes`) | Eliminar (409 si tiene visitas) | DELETE | `/api/solicitudes/{id}/` | Administrador |
| Nueva (`/solicitudes/nueva`) | Llenar los selects de adoptante y mascota | GET | `/api/adoptantes/` y `/api/mascotas/?todos=1` | Todos |
| Nueva (`/solicitudes/nueva`) | Crear la solicitud (R1: mascota adoptada; R4: pendiente repetida) | POST | `/api/solicitudes/` | Administrador, Operador |
| Detalle (`/solicitudes/:id`) | Cargar la solicitud | GET | `/api/solicitudes/{id}/` | Todos |
| Detalle (`/solicitudes/:id`) | Cargar el adoptante | GET | `/api/adoptantes/{id}/` | Todos |
| Detalle (`/solicitudes/:id`) | Cargar la mascota con su estado actualizado | GET | `/api/mascotas/{id}/` | Todos |
| Detalle (`/solicitudes/:id`) | Listar las visitas de la solicitud | GET | `/api/visitas/?solicitud={id}` | Todos |
| Detalle (`/solicitudes/:id`) | Agendar una visita: abre `/visitas/nueva?solicitud={id}` | — | (ver Visitas) | Administrador, Operador |

## Visitas

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/visitas`) | Listar visitas | GET | `/api/visitas/` | Todos |
| Lista (`/visitas`) | Mostrar solicitud, adoptante y mascota por nombre | GET | `/api/solicitudes/?todos=1`, `/api/mascotas/?todos=1`, `/api/adoptantes/` | Todos |
| Lista (`/visitas`) | Eliminar una visita | DELETE | `/api/visitas/{id}/` | Administrador |
| Nueva (`/visitas/nueva`) | Llenar el select de solicitudes (preseleccionada si llega `?solicitud=`) | GET | `/api/solicitudes/?todos=1` | Todos |
| Nueva (`/visitas/nueva`) | Crear la visita (R5: fecha pasada; R6: misma hora; R7: solicitud rechazada) | POST | `/api/visitas/` | Administrador, Operador |
| Editar (`/visitas/:id/editar`) | Cargar los datos | GET | `/api/visitas/{id}/` | Todos |
| Editar (`/visitas/:id/editar`) | Guardar los cambios, por ejemplo marcar como realizada | PUT | `/api/visitas/{id}/` | Administrador, Operador |

## Salud: vacunas

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/salud`) | Listar vacunas | GET | `/api/salud/vacunas/` | Todos |
| Nueva (`/salud/vacunas/nueva`) | Crear una vacuna (400 si el nombre se repite) | POST | `/api/salud/vacunas/` | Administrador, Operador |
| Editar (`/salud/vacunas/:id/editar`) | Cargar los datos | GET | `/api/salud/vacunas/{id}/` | Todos |
| Editar (`/salud/vacunas/:id/editar`) | Guardar los cambios | PUT | `/api/salud/vacunas/{id}/` | Administrador, Operador |
| Lista (`/salud`) | Eliminar (409 si ya fue aplicada) | DELETE | `/api/salud/vacunas/{id}/` | Administrador |

## Salud: registros de vacunación

| Pantalla (ruta) | Acción | Método | Endpoint | Perfiles |
|---|---|---|---|---|
| Lista (`/salud/registros`) | Listar registros con mascota, vacuna y fecha | GET | `/api/salud/registros/`, `/api/mascotas/?todos=1`, `/api/salud/vacunas/` | Todos |
| Lista (`/salud/registros`) | Eliminar un registro | DELETE | `/api/salud/registros/{id}/` | Administrador |
| Nuevo (`/salud/registros/nuevo`) | Llenar los selects de mascota y vacuna | GET | `/api/mascotas/?todos=1` y `/api/salud/vacunas/` | Todos |
| Nuevo (`/salud/registros/nuevo`) | Crear un registro (R8: fecha futura; registro duplicado) | POST | `/api/salud/registros/` | Administrador, Operador |
| Editar (`/salud/registros/:id/editar`) | Cargar los datos | GET | `/api/salud/registros/{id}/` | Todos |
| Editar (`/salud/registros/:id/editar`) | Guardar los cambios | PUT | `/api/salud/registros/{id}/` | Administrador, Operador |

## Códigos de respuesta que maneja la interfaz

| Código | Significado | Qué muestra el frontend |
|---|---|---|
| 400 | Datos inválidos o regla de negocio | El mensaje del backend debajo del campo o en una alerta |
| 401 | Sin sesión o token inválido | Borra la sesión y redirige a `/login` |
| 403 | El perfil no tiene permiso | "No tiene permiso para esta acción" |
| 404 | Registro inexistente | "No se encontró el registro solicitado" |
| 409 | No se puede eliminar por datos relacionados | El mensaje del backend, por ejemplo "la solicitud tiene visitas registradas" |
| Sin respuesta | Falla de red o backend apagado | "No se pudo conectar con el servidor" |