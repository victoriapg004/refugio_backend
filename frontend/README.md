Refugio de mascotas y adopciones

Sistema para administrar un refugio de mascotas. El backend es una API REST con Django 5.2, Django REST Framework y MySQL. El frontend es una aplicación React (Vite) con React Router, Axios y Bootstrap 5, ubicada en la carpeta frontend.

Requisitos

- Python 3.12 o superior, compatible con las dependencias fijadas en requirements.txt.
- MySQL Server 8 y MySQL Workbench.
- Node.js 22 LTS (o 20.19 o superior) con npm.
- Git y una terminal; los ejemplos utilizan PowerShell en Windows.
- Una cuenta MySQL con permiso de uso sobre refugio_db y permisos de creación y eliminación de bases para ejecutar las pruebas de Django.

Instalación del backend

1. Clonar el repositorio

git clone https://github.com/victoriapg004/refugio_backend.git

cd refugio_backend

2. Crear y activar el entorno virtual

py -m venv .venv

.\\.venv\Scripts\Activate.ps1

El indicador (.venv) debe aparecer al comienzo de la terminal. Si Windows bloquea la activación, ejecuta Set-ExecutionPolicy -Scope Process RemoteSigned y vuelve a activar el entorno.

3. Instalar las dependencias

python -m pip install -r requirements.txt

4. Crear el archivo de configuración .env

Copy-Item .env.example .env

Genera una clave secreta local con:

python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

Abre .env y completa las variables con tu cuenta de MySQL:

SECRET_KEY=PEGA_AQUI_TU_CLAVE_GENERADA

DEBUG=True

DB_NAME=refugio_db

DB_USER=TU_USUARIO_MYSQL

DB_PASSWORD=TU_CONTRASENA_MYSQL

DB_HOST=127.0.0.1

DB_PORT=3306

No subas .env ni compartas contraseñas o la clave secreta. El archivo .env.example solo incluye los nombres de las variables.

5. Crear la base de datos

En MySQL Workbench ejecuta:

CREATE DATABASE IF NOT EXISTS refugio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

6. Aplicar las migraciones y cargar los datos iniciales

Desde la carpeta donde se encuentra manage.py:

python manage.py migrate

python manage.py loaddata docs/datos_iniciales.json

7. Crear los usuarios de prueba

Sigue el apartado Usuarios de prueba ficticios de este documento.

Instalación del frontend

Desde la raíz del repositorio:

cd frontend

npm install

Copy-Item .env.example .env

El archivo frontend/.env.example contiene únicamente la URL base de la API, sin secretos:

VITE_API_URL=http://127.0.0.1:8000/api

Si el backend corre en otra dirección o puerto, cambia ese valor en frontend/.env.

Ejecución del backend

Con el entorno virtual activado, desde la raíz del proyecto:

python manage.py runserver

- API REST: http://127.0.0.1:8000/api/
- Administración: http://127.0.0.1:8000/admin/
- Obtener token: POST http://127.0.0.1:8000/api/token/ con el usuario y la contraseña.

Para ejecutar las pruebas automatizadas:

python manage.py test

Ejecución del frontend

Con el backend en ejecución, abre otra terminal:

cd frontend

npm run dev

Abre http://localhost:5173 e inicia sesión con uno de los usuarios de prueba.

Otros comandos, desde la carpeta frontend:

npm run lint

npm run build

Configuración CORS

El backend usa django-cors-headers. En config/settings.py se permiten los orígenes del servidor de desarrollo de Vite:

CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

Si el frontend se ejecuta en otro puerto u origen, hay que añadirlo a esa lista; de lo contrario, el navegador bloqueará las peticiones a la API.

Usuarios de prueba ficticios

Los datos iniciales no incluyen usuarios. Para reproducir los escenarios de la documentación, crea estos usuarios. Las contraseñas son de ejemplo y solo deben usarse en un entorno local.

| Usuario | Contraseña de ejemplo | Perfil | Cómo se reconoce |
|---|---|---|---|
| admin_refugio | Refugio.Admin2026 | Administrador | is_staff activado |
| operador_refugio | Refugio.Oper2026 | Operador | Pertenece al grupo Operador |
| consulta_refugio | Refugio.Cons2026 | Consulta | Sin is_staff y sin grupo |

Crear el administrador:

python manage.py createsuperuser

Crear el operador, el usuario de consulta y el grupo desde el shell de Django:

python manage.py shell

from django.contrib.auth.models import Group, User

grupo, _ = Group.objects.get_or_create(name='Operador')

operador = User.objects.create_user('operador_refugio', password='Refugio.Oper2026')

operador.groups.add(grupo)

User.objects.create_user('consulta_refugio', password='Refugio.Cons2026')

exit()

También se pueden crear desde http://127.0.0.1:8000/admin/ en Users y Groups. El grupo debe llamarse exactamente Operador, porque la API reconoce el rol por la pertenencia al grupo y no por el nombre de usuario.

Permisos de cada perfil:

- Administrador: consultar, crear, editar y eliminar.
- Operador: consultar, crear y editar; no puede eliminar (la API responde 403).
- Consulta: solo consultar; crear, editar o eliminar responde 403.

Limitaciones

- El logout no revoca el token en el servidor. Cerrar sesión borra el token y el perfil del navegador, pero el token sigue siendo válido en Django hasta que se elimine desde el administrador, porque el backend no ofrece un endpoint de revocación.
- Los tokens de Django REST Framework no caducan ni se renuevan automáticamente.
- Los GET de la API son públicos: los listados se pueden leer sin token. El frontend sí exige iniciar sesión para entrar a cualquier pantalla, y los endpoints de perfil y estadísticas exigen autenticación.
- Solo los listados de mascotas y solicitudes tienen paginación (5 registros por página) y filtros en el backend; la búsqueda por texto y el ordenamiento están disponibles en mascotas.
- Las solicitudes no se editan libremente desde la interfaz: después de crearlas solo cambian de estado (aprobar o rechazar), que es la operación definida por las reglas de negocio.
- La configuración DEBUG=True y ALLOWED_HOSTS=[] está orientada a desarrollo local, no a producción.
- No hay recuperación automática de contraseñas por correo.