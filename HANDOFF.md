# HANDOFF: Refugio de mascotas y adopciones

Documento de traspaso entre integrantes. Explica qué está hecho, cómo ejecutar el proyecto y qué falta.

## 1. Qué es el proyecto
API REST en Django y Django REST Framework para un refugio de mascotas. Gestiona mascotas, adoptantes, solicitudes de adopción, visitas de evaluación y el historial de vacunación.

**Proceso de negocio:** el adoptante envía una solicitud por una mascota, se agenda una visita, un operador aprueba o rechaza la solicitud y la mascota pasa a "adoptada".

**Stack:** Python, Django 5.2, Django REST Framework, MySQL, autenticación por token. Se prueba con Postman.

## 2. Qué está hecho (rama `base-api`)
- Repositorio, entorno virtual, `requirements.txt`, configuración por `.env` y base de datos MySQL.
- Los 5 módulos con sus modelos y migraciones.
- CRUD completo (GET, POST, PUT, PATCH, DELETE) de los 5 módulos con vistas `@api_view`, igual que en el proyecto `game_arena` de clase.
- Login por token en `/api/token/`.
- Permisos básicos: cualquiera puede leer (GET); solo un usuario administrador (`is_staff`) puede crear, editar y borrar.
- Respuestas 400, 403, 404 y 409. El 409 sale al borrar algo con registros relacionados (`on_delete=PROTECT`).
- Datos ficticios de ejemplo en `docs/datos_iniciales.json`.
- Colección Postman base en `docs/refugio_postman_collection.json`.

### Modelos y relaciones
| App | Modelo | Relaciones |
|---|---|---|
| `mascotas` | `Mascota` | |
| `adoptantes` | `Adoptante` | |
| `solicitudes` | `SolicitudAdopcion` | FK a `Adoptante` y a `Mascota` (1:N, PROTECT) |
| `visitas` | `Visita` | FK a `SolicitudAdopcion` (1:N, PROTECT) |
| `salud` | `Vacuna` y `RegistroVacunacion` | `RegistroVacunacion` une `Mascota` y `Vacuna` (N:M con datos propios, PROTECT) |

Restricciones únicas: cédula y correo del adoptante, nombre de la vacuna, y la combinación mascota + vacuna + fecha en el registro de vacunación.

### Endpoints
| Módulo | Lista y creación | Detalle, edición y borrado |
|---|---|---|
| Token | `POST /api/token/` | |
| Mascotas | `/api/mascotas/` | `/api/mascotas/<id>/` |
| Adoptantes | `/api/adoptantes/` | `/api/adoptantes/<id>/` |
| Solicitudes | `/api/solicitudes/` | `/api/solicitudes/<id>/` |
| Visitas | `/api/visitas/` | `/api/visitas/<id>/` |
| Vacunas | `/api/salud/vacunas/` | `/api/salud/vacunas/<id>/` |
| Registros de vacunación | `/api/salud/registros/` | `/api/salud/registros/<id>/` |

## 3. Cómo ejecutarlo
1. Clonar el repositorio y entrar a la carpeta.
2. Crear y activar el entorno virtual:
   ```powershell
   py -m venv .venv
   .venv\Scripts\activate
   ```
3. Instalar dependencias:
   ```powershell
   py -m pip install -r requirements.txt
   ```
4. Crear la base en MySQL Workbench:
   ```sql
   CREATE DATABASE refugio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. Crear el archivo `.env` en la raíz copiando `.env.example` y llenando `SECRET_KEY`, `DB_USER` y `DB_PASSWORD`. Para `SECRET_KEY` sirve cualquier texto largo.
6. Migrar y cargar los datos de ejemplo:
   ```powershell
   py manage.py migrate
   py manage.py loaddata docs/datos_iniciales.json
   ```
7. Crear el superusuario (administrador) con el nombre y la contraseña que cada quien elija:
   ```powershell
   py manage.py createsuperuser
   ```
8. Crear los otros dos usuarios desde `http://127.0.0.1:8000/admin/` → Users → Add user, **sin marcar** Staff ni Superuser:

   | Rol | Usuario | Contraseña |
   |---|---|---|
   | Operador | `operador` | `Refugio2026*` |
   | Consulta | `consulta` | `Huellas2026*` |

9. Levantar el servidor:
   ```powershell
   py manage.py runserver
   ```
10. En Postman, importar `docs/refugio_postman_collection.json`, llenar la variable `admin_password` y ejecutar primero la carpeta `Auth`.

## 4. Pendiente (parte de la segunda integrante)
Cada tarea tiene un ejemplo resuelto en el proyecto `game_arena` de clase.

| # | Tarea | Ejemplo en `game_arena` |
|---|---|---|
| 1 | **Permisos por rol:** administrador todo; operador crea y edita pero no borra; consulta solo lee. Hoy solo se distingue administrador de los demás. | bloques `is_staff` e `is_authenticated` en `torneos/views.py` |
| 2 | **Filtros, búsqueda, ordenamiento y paginación** en los listados. | `paginar_torneos` y el filtro por `estado` |
| 3 | **8 reglas de negocio** que respondan 400, también al editar con PATCH. Ideas: no adoptar una mascota ya adoptada; no aprobar una solicitud sin visita realizada; no dos visitas a la misma hora; no agendar una visita en el pasado; no solicitar una mascota que ya tiene una solicitud aprobada; la fecha de vacunación no puede ser futura. | `validate()` en `InscripcionSerializer` |
| 4 | **5 consultas ORM no triviales** (conteos, agregaciones, filtros por relación, `select_related` y `prefetch_related`). | `estadisticas_admin_api` |
| 5 | **Pruebas automatizadas:** mínimo 15 (CRUD, reglas, permisos, paginación). | |
| 6 | **Postman:** completar y revisar hasta tener al menos 20 solicitudes con sus resultados esperados. | |
| 7 | **Documentación:** `README`, diagrama ER, matriz de permisos y catálogo de endpoints. | |
| 8 | **Archivo `.txt`** con el enlace del repositorio para la mediación virtual. | |

## 5. Forma de trabajo
- Cada integrante trabaja en su propia rama y entrega con pull request hacia `main`. Nunca se sube directo a `main`.
- La segunda integrante debe **revisar y aprobar** el pull request de `base-api` antes de unirlo, y crear su rama desde `main` ya actualizado (por ejemplo `seguridad-pruebas`).
- Nunca subir `.env` ni `.venv` (ya están en `.gitignore`).
- Para la defensa, ambas deben poder explicar el flujo completo: solicitud HTTP → vista → serializer → ORM → respuesta.
