# Refugio de Mascotas — API REST

API REST para gestionar mascotas, adoptantes, solicitudes de adopción, visitas de evaluación, vacunas y registros de vacunación. Desarrollada con Django 5.2, Django REST Framework y MySQL; usa autenticación por token y permisos por roles.

## Requisitos

- Python compatible con Django 5.2 y los paquetes del archivo `requirements.txt`.
- MySQL Server y, opcionalmente, MySQL Workbench.
- Git, terminal PowerShell (ejemplos para Windows), Postman para probar la API.
- Usuario de MySQL con permisos para `refugio_db`; para pruebas, permisos de creación/eliminación de la base de pruebas.

## Instalación local
1. Clonar el repositorio y entrar a la carpeta raíz (sustituir la URL):
   ```powershell
   git clone URL_DEL_REPOSITORIO
   cd refugio_backend
   ```
2. Crear y activar un entorno virtual:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Instalar dependencias:
   ```powershell
   py -m pip install -r requirements.txt
   ```
4. Crear `.env` a partir de `.env.example`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Completar `SECRET_KEY`, `DB_NAME=refugio_db`, `DB_USER`, `DB_PASSWORD`, `DB_HOST=127.0.0.1`, `DB_PORT=3306` y `DEBUG=True` solo para desarrollo. **No subir `.env` al repositorio.**
5. En MySQL Workbench, crear la base:
   ```sql
   CREATE DATABASE refugio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
6. Ejecutar migraciones y cargar los datos iniciales:
   ```powershell
   py manage.py migrate
   py manage.py loaddata docs/datos_iniciales.json
   ```
7. Crear un superusuario administrador:
   ```powershell
   py manage.py createsuperuser
   ```
8. Crear los usuarios `operador` y `consulta` y el grupo `Operador` desde la consola Django, o mediante el admin (si se usa el admin, asignar los permisos de acceso al sitio que correspondan):
   ```powershell
   py manage.py shell
   ```
   ```python
   from django.contrib.auth.models import Group, User
   grupo, _ = Group.objects.get_or_create(name='Operador')
   operador = User.objects.create_user(username='operador', password='CAMBIAR_CONTRASENA_OPERADOR')
   consulta = User.objects.create_user(username='consulta', password='CAMBIAR_CONTRASENA_CONSULTA')
   operador.groups.add(grupo)
   exit()
   ```
   Cambiar ambos marcadores de contraseña por claves privadas seguras. Estos usuarios no necesitan `is_staff` ni `is_superuser` para la API. El grupo **debe llamarse exactamente `Operador`**.
9. Ejecutar el servidor:
   ```powershell
   py manage.py runserver
   ```
   API: `http://127.0.0.1:8000/`; administración: `http://127.0.0.1:8000/admin/`.

## Autenticación y permisos

Obtener un token con `POST /api/token/` enviando `username` y `password`. En solicitudes protegidas incluir `Authorization: Token TU_TOKEN`. En los endpoints CRUD, GET es público; administrador (`is_staff`) puede crear, editar y borrar; usuarios del grupo `Operador` pueden crear y editar, pero no borrar; `consulta` solamente lee. Operaciones de escritura sin autenticación devuelven 401 y operaciones prohibidas para usuarios autenticados devuelven 403. `GET /api/estadisticas/` exige autenticación.

## Pruebas

Ejecutar todas las pruebas:
```powershell
py manage.py test
```
Solo las pruebas nuevas:
```powershell
py manage.py test adoptantes salud
```
Django necesita poder crear su base de datos de pruebas en MySQL. Verificar que la terminal indique `OK` antes de enviar la rama.

## Colección Postman

1. Abrir Postman y seleccionar **Import**.
2. Importar `docs/refugio_postman_collection.json`.
3. Revisar la variable `base_url` (`http://127.0.0.1:8000`).
4. Completar los datos de autenticación usados en la colección. Ejecutar la solicitud de `/api/token/` de la carpeta Auth.
5. Copiar el token a la variable `token` si la colección no lo establece automáticamente. Los endpoints protegidos usan el encabezado `Authorization: Token {{token}}`.
6. Probar el resto de solicitudes y revisar los códigos HTTP.

## Limitaciones conocidas

- Es una API sin frontend público; se usa mediante Postman u otro cliente HTTP.
- Requiere MySQL y configuración local de credenciales; no incorpora despliegue de producción.
- `ALLOWED_HOSTS = []` y `DEBUG=True` están destinados al uso local; adaptar la configuración antes de desplegar.
- Autenticación de token estándar sin vencimiento/rotación automática implementados en este proyecto.
- La paginación de cinco elementos y los filtros se aplican a mascotas y solicitudes; los demás listados no implementan esa paginación.
- Los roles dependen de `is_staff` y de la membresía al grupo `Operador`.
- No se implementa recuperación automática de contraseñas por correo.

## Documentación

Consultar `docs/documentacion_tecnica.md` y `docs/diagrama_er.png`. El diagrama entregado se ha generado a partir de los modelos Django; para entregar la exportación requerida por Workbench hay que ejecutar **Database → Reverse Engineer** sobre la base migrada y sustituir la imagen.
