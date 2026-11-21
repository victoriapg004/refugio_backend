# Escenarios manuales del frontend

## 1. Login correcto
- Pasos: entrar con `admin_refugio` y su contraseña.
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

## 8. Filtros combinados
- Pasos: en Solicitudes, elegir el estado "Pendiente" y, además, un adoptante en el filtro de adoptantes. Luego pulsar "Limpiar filtros".
- Resultado esperado: se consulta `GET /api/solicitudes/?estado=pendiente&adoptante=<id>&pagina=1` y la tabla muestra solo las solicitudes pendientes de ese adoptante, con el total de registros que devuelve el backend. Al limpiar vuelven a aparecer todas.
- Resultado obtenido: correcto.

## 9. Paginación
- Pasos: con más de 5 solicitudes registradas, entrar a Solicitudes y pulsar "Siguiente" y "Anterior".
- Resultado esperado: se muestran 5 registros por página, el indicador cambia ("Página 1 de 2", "Página 2 de 2") y cada cambio consulta `GET /api/solicitudes/?pagina=<n>`.
- Resultado obtenido: correcto.

## 10. Regla de negocio con error 400
- Pasos: en Solicitudes, pulsar "Nueva solicitud", elegir una mascota en estado "Adoptada" y guardar.
- Resultado esperado: 400 y el mensaje "No se puede solicitar una mascota ya adoptada." en la alerta y debajo del campo Mascota; no se crea la solicitud.
- Resultado obtenido: correcto.

## 11. Perfil consulta
- Pasos: con `consulta_refugio`, entrar a `/mascotas/nueva` y guardar.
- Resultado esperado: alerta de 403 "No tiene permiso para esta acción"; en la lista no hay botones de crear ni borrar.
- Resultado obtenido: correcto.

## 12. Ruta privada sin sesión
- Pasos: cerrar sesión y escribir `http://localhost:5173/solicitudes` en la barra de direcciones. Luego, en una ventana de incógnito, abrir `http://127.0.0.1:8000/api/perfil/`.
- Resultado esperado: el frontend redirige a `/login` y la API responde 401 porque no hay token.
- Resultado obtenido: correcto.

## Capturas

Están en `docs/capturas_frontend/`:
- `login.png`
- `Dashboard.png`
- `Mascotas.png`
- `validacion de error.png`
- `validacion de error 403.png`
- `adoptantesAdmin.png`
- `adoptantesConsulta.png`
- `adoptantesNuevo.png`
- `adoptantesErrorCedula.png`
- `adoptantesEditar.png`
- `recargaPaginas.png`
- `filtros combinados.png`
- `filtro por estado.png`
- `paginacion lista solicitudes.png`
- `error R1 mascota ya adoptada.png`
- `error R2 aprobar sin visita realizada.png`
- `error R3 mascota con solicitud aprobada.png`
- `error R4 solicitud pendiente repetida.png`
- `error 409 eliminar con visitas.png`
- `ruta privada sin sesion redirige a login.png`
- `api sin token responde 401.png`
- `agendar visita desde detalle.png`
- `visita marcada realizada.png`
- `solicitud aprobada mascota adoptada.png`
- `perfil operador solicitudes.png`
- `perfil consulta solicitudes.png`
- `solicitud en modo responmsivo o movil .png`
- `Detalle modo responsivo o movil .png`