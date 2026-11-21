# Escenarios manuales del frontend

## 1. Login correcto
- Pasos: entrar con el usuario administrador `VBA` y su contraseña.
- Resultado esperado: llega al Dashboard y la barra muestra el usuario y el rol.
- Resultado obtenido: correcto.

## 2. Contraseña incorrecta
- Pasos: entrar con una contraseña mala.
- Resultado esperado: alerta "Usuario o contraseña incorrectos" y se queda en el login.
- Resultado obtenido: correcto.

## 3. Logout
- Pasos: clic en "Cerrar sesión".
- Resultado esperado: regresa a `/login` y se borran `token` y `perfil` de localStorage.
- Resultado obtenido: correcto.

## 4. Navegación entre módulos
- Pasos: con la sesión iniciada, pulsar en el menú Mascotas, Adoptantes, Solicitudes, Visitas y Salud.
- Resultado esperado: cambia de pantalla sin recargar la página.
- Resultado obtenido: correcto.

## 5. Crear un adoptante
- Pasos: en Adoptantes, pulsar "Nuevo adoptante", llenar nombre, cédula y correo y guardar. Luego repetir con la misma cédula.
- Resultado esperado: 201, vuelve a la lista, aparece el adoptante y la alerta de éxito. Con la cédula repetida: 400 y el mensaje debajo del campo.
- Resultado obtenido: correcto.

## 6. Editar un adoptante
- Pasos: en la lista, pulsar "Editar", cambiar el teléfono y guardar.
- Resultado esperado: formulario precargado, 200, la lista muestra el cambio y la alerta de éxito.
- Resultado obtenido: correcto.

## 7. Eliminar mascota
- Pasos: (a) eliminar una mascota sin solicitudes. (b) Eliminar una con solicitudes.
- Resultado esperado: (a) pide confirmación y la elimina. (b) Mensaje del 409: "No se puede eliminar: la mascota tiene solicitudes o registros de vacunación."
- Resultado obtenido: correcto.

## 11. Perfil consulta
- Pasos: con el usuario `consulta1`, entrar a `/mascotas/nueva` y guardar.
- Resultado esperado: alerta de 403 "No tiene permiso para esta acción"; en la lista no hay botones de crear ni borrar.
- Resultado obtenido: correcto.

## Capturas

Están en `docs/capturas_frontend/`:
- `login.png`
- `Dashboard.png`
- `Mascotas.png`
- `validacion de error.png`
- `validacion de error 403.png`
- `adoptantesListaAdmin.png`
- `adoptantesListaConsulta.png`
- `adoptantesNuevo.png`
- `adoptantesErrorCedula.png`
- `adoptantesEditar.png`
- `recargaPaginas.png`