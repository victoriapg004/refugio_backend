Refugio de mascotas y adopciones
Sistema para administrar un refugio de mascotas, desarrollado para el curso Desarrollo de Software IV de la Universidad de Costa Rica, Sede del Pacífico.

El backend (Proyecto 1) es una API REST con Django 5.2, Django REST Framework y MySQL, ubicada en la raíz de este repositorio. El frontend (Proyecto 2) es una aplicación SPA con React (Vite), React Router, Axios y Bootstrap 5, ubicada en la carpeta frontend. El frontend consume la API del Proyecto 1; no utiliza datos simulados.

El proceso de adopción comienza cuando una persona solicita adoptar una mascota. Posteriormente se programa una visita de evaluación; según el resultado, la solicitud puede aprobarse o rechazarse. Al aprobarse, la mascota cambia al estado adoptada. El sistema también administra vacunas y registros de vacunación.
Módulos
El módulo mascotas permite registrar mascotas y administrar sus estados: disponible, en proceso y adoptada. En el frontend, la pantalla /mascotas tiene CRUD completo, filtros, búsqueda, ordenamiento y paginación.

El módulo adoptantes almacena los datos de las personas interesadas en adoptar. En el frontend, la pantalla /adoptantes tiene CRUD completo.

El módulo solicitudes gestiona las solicitudes que relacionan a los adoptantes con las mascotas. En el frontend, la pantalla /solicitudes permite crear, consultar, aprobar o rechazar y eliminar, con filtros combinados y paginación.

El módulo visitas administra las visitas de evaluación relacionadas con una solicitud. En el frontend, la pantalla /visitas tiene CRUD completo.

El módulo salud gestiona las vacunas y los registros de vacunación de las mascotas. En el frontend, las pantallas /salud y /salud/registros tienen CRUD completo.

La información detallada de reglas de negocio, permisos, endpoints y relaciones se encuentra en docs/documentacion_tecnica.md.
Requisitos
- Python 3.12 o superior, compatible con las dependencias fijadas en requirements.txt.
- MySQL Server 8 y MySQL Workbench para administrar la base y generar el diagrama ER.
- Node.js 22 LTS (o 20.19 o superior) con npm, para el frontend.
- Git y una terminal; los ejemplos siguientes utilizan PowerShell en Windows.
- Postman para importar y ejecutar la colección de peticiones (opcional).
- Una cuenta MySQL con permiso de uso sobre refugio_db y permisos de creación y eliminación de bases para ejecutar las pruebas de Django.
Instalación del backend
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
7. Crear los usuarios de prueba
Sigue el apartado Usuarios de prueba ficticios de este documento.
Instalación del frontend
Desde la raíz del repositorio:
cd frontend
npm install
Copy-Item .env.example .env
El archivo frontend/.env.example contiene únicamente la URL base de la API, sin secretos:
VITE_API_URL=http://127.0.0.1:8000/api
Si el backend corre en otra dirección o puerto, cambia ese valor en frontend/.env. Todas las llamadas HTTP salen de frontend/src/api/cliente.js, que usa esta variable y adjunta el token.
Ejecución del backend
Con el entorno virtual activado, desde la raíz del proyecto:
python manage.py runserver
- API REST: http://127.0.0.1:8000/api/
- Administración: http://127.0.0.1:8000/admin/
- Obtener token: POST http://127.0.0.1:8000/api/token/
Para solicitar un token, envía un JSON con las credenciales del usuario creado:
{
  "username": "operador",
  "password": "operadormascotas"
}
En las solicitudes protegidas incluye la cabecera Authorization: Token TU_TOKEN.
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
Los datos iniciales no incluyen usuarios. Para reproducir los escenarios de docs/escenarios_manuales.md, crea estos tres usuarios. Son cuentas ficticias que solo existen en la base local de pruebas; no se usan en ningún otro sistema.

| Usuario | Contraseña | Perfil | Cómo se reconoce |
|---|---|---|---|
| VBA | hada | Administrador | is_staff activado |
| operador | operadormascotas | Operador | Pertenece al grupo Operador |
| consulta1 | galagarza | Consulta | Sin is_staff y sin grupo |

Crear el administrador con el usuario VBA:
python manage.py createsuperuser
La contraseña hada es más corta que el mínimo que exige Django, así que createsuperuser mostrará una advertencia y preguntará Bypass password validation and create user anyway? [y/N]: responde y.

Crear el grupo, el operador y el usuario de consulta desde el shell de Django:
python manage.py shell
from django.contrib.auth.models import Group, User

grupo, _ = Group.objects.get_or_create(name='Operador')
operador = User.objects.create_user('operador', password='operadormascotas')
operador.groups.add(grupo)
User.objects.create_user('consulta1', password='galagarza')
exit()

También se pueden crear desde http://127.0.0.1:8000/admin/ en Users y Groups. El grupo debe llamarse exactamente Operador, porque la API reconoce el rol por la pertenencia al grupo y no por el nombre de usuario.
Roles y permisos
El administrador puede consultar, crear, actualizar y eliminar registros mediante GET, POST, PUT, PATCH y DELETE. El proyecto reconoce al administrador por el atributo is_staff.

El operador puede consultar, crear y actualizar registros mediante GET, POST, PUT y PATCH. No tiene autorización para eliminar; la API responde 403. Para reconocer este rol, el usuario debe pertenecer al grupo Operador.

El usuario consulta únicamente puede realizar operaciones GET. Crear, modificar o eliminar registros responde 403.

Los usuarios sin autenticar pueden utilizar los GET públicos, pero las operaciones de escritura sin token devuelven el código HTTP 401. Los endpoints GET /api/perfil/ y GET /api/estadisticas/ requieren autenticación.

La autorización real se aplica en Django (config/permisos.py). El frontend oculta los botones que el perfil no puede usar (usePermisos.js), pero si se fuerza la acción la API responde 403 y la interfaz muestra el mensaje. Además, el frontend exige iniciar sesión para entrar a cualquier pantalla (RutaProtegida.jsx). El detalle está en docs/matriz_perfiles_permisos.md.
Pruebas automatizadas
Las pruebas cubren creación y validación de datos, reglas de negocio, permisos, filtros, paginación y estadísticas.

Ejecutar todas las pruebas:
python manage.py test
Ejecutar las pruebas de los módulos adoptantes y salud:
python manage.py test adoptantes salud
Django crea una base temporal, normalmente test_refugio_db, para ejecutar las pruebas; la cuenta MySQL debe tener permisos para crearla y eliminarla. Al terminar correctamente, la consola debe mostrar OK.

Si aparece The SECRET_KEY setting must not be empty, completa SECRET_KEY en .env. Si aparece Access denied for user, revisa las credenciales y los permisos de MySQL.

Las pruebas manuales del frontend (login, logout, navegación, CRUD, filtros, paginación, validaciones y accesos denegados) están en docs/escenarios_manuales.md, con sus capturas en docs/capturas_frontend/.
Colección de Postman
1. Abre Postman y selecciona Import.
2. Importa el archivo docs/refugio_postman_collection.json.
3. En la pestaña Variables de la colección, comprueba que base_url sea http://127.0.0.1:8000.
4. Completa admin_password con la contraseña local del administrador y revisa que la petición de login use el usuario administrador que creaste.
5. Ejecuta primero la carpeta Auth para obtener los tokens. La colección puede guardarlos en las variables token, token_operador y token_consulta.
6. Ejecuta las demás solicitudes o usa Run collection y revisa los códigos HTTP esperados. Si una petición requiere token, utiliza Authorization: Token {{token}} o la variable de rol correspondiente.
Limitaciones conocidas
- El logout no revoca el token en el servidor. Cerrar sesión borra el token y el perfil del navegador (localStorage), pero el token sigue siendo válido en Django hasta que se elimine desde el administrador, porque el backend no ofrece un endpoint de revocación.
- Los tokens estándar de DRF no caducan ni se renuevan automáticamente en este proyecto.
- Los GET públicos permiten leer listados sin autenticación. El frontend sí exige iniciar sesión para entrar a cualquier pantalla.
- Solo los listados de mascotas y solicitudes incluyen paginación de cinco registros y filtros en el backend; la búsqueda por texto y el ordenamiento están disponibles en mascotas.
- Las solicitudes no se editan libremente desde la interfaz: después de crearlas solo cambian de estado (aprobar o rechazar), que es la operación definida por las reglas de negocio. Por eso el CRUD completo se implementa en mascotas, adoptantes, visitas y salud.
- La configuración de DEBUG=True y ALLOWED_HOSTS=[] está orientada a desarrollo local; no está preparada para despliegue en producción.
- La base de datos requiere MySQL configurado localmente y permisos adicionales para ejecutar las pruebas.
- No hay recuperación automática de contraseñas por correo.
Documentación técnica
La documentación técnica del proyecto se encuentra en docs/documentacion_tecnica.md. Este archivo contiene el diagrama entidad-relación, la matriz de permisos, las 10 reglas de negocio, el inventario de endpoints (método, autenticación, permisos, parámetros, estructura JSON y códigos de respuesta) y las ampliaciones del backend realizadas para el frontend.
El diagrama entidad-relación fue generado mediante MySQL Workbench utilizando la opción Database -> Reverse Engineer sobre la base de datos refugio_db. La imagen se encuentra en docs/diagrama_er.png y el modelo editable en docs/diagrama.mwb.

Otros documentos en la carpeta docs:
- docs/matriz_pantallas_endpoints.md: cada acción de la interfaz con su método y ruta REST.
- docs/matriz_perfiles_permisos.md: qué puede hacer cada perfil en la interfaz y en la API.
- docs/escenarios_manuales.md: escenarios manuales reproducibles del frontend.
- docs/capturas_frontend/: capturas del login, dashboard, cinco módulos, formularios y errores.
Trabajo en equipo
Proyecto desarrollado de manera colaborativa por tres integrantes. Las modificaciones se registran mediante commits y pull requests en GitHub, y otro integrante las revisa antes de integrarlas a main.