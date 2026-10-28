Refugio de mascotas y adopciones: API REST
API REST desarrollada con Django 5.2, Django REST Framework y MySQL para administrar un refugio de mascotas. Es un proyecto de Desarrollo de Software IV de la Universidad de Costa Rica, Sede del Pacífico.

El proceso de adopción comienza cuando una persona solicita adoptar una mascota. Posteriormente se programa una visita de evaluación; según el resultado, la solicitud puede aprobarse o rechazarse. Al aprobarse, la mascota cambia al estado adoptada. El sistema también administra vacunas y registros de vacunación.
Módulos
El módulo mascotas permite registrar mascotas y administrar sus estados: disponible, en proceso y adoptada.

El módulo adoptantes almacena los datos de las personas interesadas en adoptar.

El módulo solicitudes gestiona las solicitudes que relacionan a los adoptantes con las mascotas.

El módulo visitas administra las visitas de evaluación relacionadas con una solicitud.

El módulo salud gestiona las vacunas y los registros de vacunación de las mascotas.

La información detallada de reglas de negocio, permisos, endpoints y relaciones se encuentra en docs/documentacion_tecnica.md.
Requisitos
- Python 3.12 o superior, compatible con las dependencias fijadas en requirements.txt.
- MySQL Server 8 y MySQL Workbench para administrar la base y generar el diagrama ER.
- Git y una terminal; los ejemplos siguientes utilizan PowerShell en Windows.
- Postman para importar y ejecutar la colección de peticiones.
- Una cuenta MySQL con permiso de uso sobre refugio_db y permisos de creación y eliminación de bases para ejecutar las pruebas de Django.
Instalación paso a paso
1. Clonar el repositorio
git clone https://github.com/victoriapg004/refugio_backend.git
cd refugio_backend
Si ya tienes el proyecto descargado y abierto en VS Code, no necesitas clonarlo nuevamente.
2. Crear y activar el entorno virtual
py -m venv .venv
.\.venv\Scripts\Activate.ps1
El indicador (.venv) debe aparecer al comienzo de la terminal. Si Windows bloquea la activación, puedes habilitar scripts para esa sesión con Set-ExecutionPolicy -Scope Process RemoteSigned y volver a activar el entorno.
3. Instalar las dependencias
python -m pip install -r requirements.txt
4. Crear el archivo de configuración .env
Copy-Item .env.example .env
Genera una clave secreta local mediante:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
Abre .env y completa las variables según la cuenta de MySQL que tienes configurada:
SECRET_KEY=PEGA_AQUI_TU_CLAVE_GENERADA
DEBUG=True
DB_NAME=refugio_db
DB_USER=TU_USUARIO_MYSQL
DB_PASSWORD=TU_CONTRASENA_MYSQL
DB_HOST=127.0.0.1
DB_PORT=3306
No subas .env ni compartas las contraseñas o la clave secreta. El archivo .env.example solamente incluye los nombres de las variables necesarias.
5. Crear la base de datos
En MySQL Workbench, abre tu conexión y ejecuta:
CREATE DATABASE IF NOT EXISTS refugio_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
Comprueba que aparece con SHOW DATABASES;. El usuario configurado en .env debe tener acceso a ella.
6. Aplicar las migraciones y cargar los datos iniciales
En PowerShell, desde la carpeta donde se encuentra manage.py:
python manage.py migrate
python manage.py loaddata docs/datos_iniciales.json
7. Crear el usuario administrador
python manage.py createsuperuser
Completa el nombre, correo y contraseña solicitados. Este usuario administrará el sistema y tendrá acceso al sitio /admin/.
8. Crear los usuarios operador y consulta
Inicia el servidor:
python manage.py runserver
Abre http://127.0.0.1:8000/admin/, inicia sesión con el superusuario y crea dos usuarios desde Users: operador y consulta. Establece contraseñas privadas para cada uno y deja desmarcadas las opciones Staff status y Superuser status.

Desde Groups, crea el grupo con el nombre exacto Operador y asígnale el usuario operador. El usuario consulta debe quedar fuera de ese grupo. La API reconoce el rol de operador por la pertenencia al grupo, no por el nombre de usuario.

Alternativamente, el grupo se puede crear y asignar desde Django shell, una vez creados ambos usuarios:
python manage.py shell
from django.contrib.auth.models import Group, User

grupo, _ = Group.objects.get_or_create(name='Operador')
operador = User.objects.get(username='operador')
operador.groups.add(grupo)
exit()
Ejecución del servidor
Con el entorno virtual activado, desde la raíz del proyecto:
python manage.py runserver
- API REST: http://127.0.0.1:8000/api/
- Administración: http://127.0.0.1:8000/admin/
- Obtener token: POST http://127.0.0.1:8000/api/token/
Para solicitar un token, envía un JSON con las credenciales del usuario creado:
{
  "username": "operador",
  "password": "CONTRASENA_CONFIGURADA_PARA_OPERADOR"
}
En las solicitudes protegidas incluye la cabecera Authorization: Token TU_TOKEN.
Roles y permisos
El administrador puede consultar, crear, actualizar y eliminar registros mediante GET, POST, PUT, PATCH y DELETE. El proyecto reconoce al administrador por el atributo is_staff.

El operador puede consultar, crear y actualizar registros mediante GET, POST, PUT y PATCH. No tiene autorización para eliminar. Para reconocer este rol, el usuario debe pertenecer al grupo Operador.

El usuario consulta únicamente puede realizar operaciones GET. No puede crear, modificar ni eliminar registros.

Los usuarios sin autenticar pueden utilizar los GET públicos, pero las operaciones de escritura sin token devuelven el código HTTP 401.

Un usuario autenticado sin permiso de escritura recibe 403. El endpoint GET /api/estadisticas/ requiere autenticación, aunque los listados públicos acepten GET sin token.
Pruebas automatizadas
Las pruebas cubren creación y validación de datos, reglas de negocio, permisos, filtros, paginación y estadísticas.

Ejecutar todas las pruebas:
python manage.py test
Ejecutar las pruebas de los módulos adoptantes y salud:
python manage.py test adoptantes salud
Django crea una base temporal, normalmente test_refugio_db, para ejecutar las pruebas; la cuenta MySQL debe tener permisos para crearla y eliminarla. Al terminar correctamente, la consola debe mostrar OK.

Si aparece The SECRET_KEY setting must not be empty, completa SECRET_KEY en .env. Si aparece Access denied for user, revisa las credenciales y los permisos de MySQL.
Colección de Postman
1. Abre Postman y selecciona Import.
2. Importa el archivo docs/refugio_postman_collection.json.
3. En la pestaña Variables de la colección, comprueba que base_url sea http://127.0.0.1:8000.
4. Completa admin_password con la contraseña local del administrador y revisa que la petición de login use el usuario administrador que creaste.
5. Ejecuta primero la carpeta Auth para obtener los tokens. La colección puede guardarlos en las variables token, token_operador y token_consulta.
6. Ejecuta las demás solicitudes o usa Run collection y revisa los códigos HTTP esperados. Si una petición requiere token, utiliza Authorization: Token {{token}} o la variable de rol correspondiente.
Limitaciones conocidas
- No incluye frontend público; se utiliza mediante Postman u otro cliente HTTP y el administrador de Django.
- Solo los listados de mascotas y solicitudes incluyen paginación de cinco registros y filtros; la búsqueda por texto está disponible en mascotas.
- Los tokens estándar de DRF no caducan ni se renuevan automáticamente en este proyecto.
- Los GET públicos permiten leer listados sin autenticación; el perfil consulta tiene las mismas capacidades de lectura, excepto que las estadísticas exigen autenticación.
- La configuración de DEBUG=True y ALLOWED_HOSTS=[] está orientada a desarrollo local; no está preparada para despliegue en producción.
- La base de datos requiere MySQL configurado localmente y permisos adicionales para ejecutar las pruebas.
- No hay recuperación automática de contraseñas por correo.
Documentación técnica
Consulta docs/documentacion_tecnica.md para la matriz de permisos, las diez reglas de negocio y el catálogo de endpoints. El diagrama entidad-relación debe exportarse desde MySQL Workbench mediante Database → Reverse Engineer y guardarse como docs/diagrama_er.png.
Trabajo en equipo
Proyecto desarrollado de manera colaborativa. Las modificaciones se registran mediante commits y pull requests en GitHub para su revisión antes de integrarse a main.