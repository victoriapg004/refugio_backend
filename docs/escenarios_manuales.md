# Escenarios manuales del frontend

Pruebas manuales reproducibles con los usuarios de prueba: `VBA` (administrador), `operador` y `consulta1` (consulta). Requieren el backend (`python manage.py runserver`) y el frontend (`npm run dev`) en ejecución. Las capturas están en `docs/capturas_frontend/`.

## 1. Login correcto
- Pasos: entrar con el usuario administrador `VBA` y su contraseña.
- Resultado esperado: llega al Dashboard y la barra muestra el usuario y el rol.
- Resultado obtenido: correcto.
- Capturas: `login.png`, `Dashboard.png`.

## 2. Contraseña incorrecta
- Pasos: entrar con una contraseña mala.
- Resultado esperado: alerta "Usuario o contraseña incorrectos" y se queda en el login.
- Resultado obtenido: correcto.

## 3. Logout
- Pasos: clic en "Cerrar sesión".
- Resultado esperado: regresa a `/login` y se borran `token` y `perfil` de localStorage. El token no se revoca en el servidor (ver limitaciones del README).
- Resultado obtenido: correcto.

## 4. Navegación entre módulos
- Pasos: con la sesión iniciada, pulsar en el menú Mascotas, Adoptantes, Solicitudes, Visitas y Salud.
- Resultado esperado: cambia de pantalla sin recargar la página.
- Resultado obtenido: correcto.
- Capturas: `Mascotas.png`, `adoptantesAdmin.png`, `perfil operador solicitudes.png`, `perfil_operador.png` (Visitas), `Perfil_operador_salud.png` (Salud).

## 5. Crear un adoptante
- Pasos: en Adoptantes, pulsar "Nuevo adoptante", llenar nombre, cédula y correo y guardar. Luego repetir con la misma cédula.
- Resultado esperado: 201, vuelve a la lista, aparece el adoptante y la alerta de éxito. Con la cédula repetida: 400 y el mensaje debajo del campo.
- Resultado obtenido: correcto.
- Capturas: `adoptantesNuevo.png`, `adoptantesErrorCedula.png`.

## 6. Editar un adoptante
- Pasos: en la lista, pulsar "Editar", cambiar el teléfono y guardar.
- Resultado esperado: formulario precargado, 200, la lista muestra el cambio y la alerta de éxito.
- Resultado obtenido: correcto.
- Captura: `adoptantesEditar.png`.

## 7. Eliminar mascota
- Pasos: (a) eliminar una mascota sin solicitudes. (b) Eliminar una con solicitudes.
- Resultado esperado: (a) pide confirmación y la elimina. (b) Mensaje del 409: "No se puede eliminar: la mascota tiene solicitudes o registros de vacunación."
- Resultado obtenido: correcto.
- Capturas: `Mensaje de confirmacion para eliminar.png`, `validacion de eliminar si no tiene registros.png`, `Validacion de no eliminar si tiene un registro.png`.

## 8. Filtros combinados en solicitudes
- Pasos: en Solicitudes, elegir Estado *Pendiente* y, además, un adoptante en el filtro de adoptantes. Luego pulsar "Limpiar filtros".
- Resultado esperado: el frontend envía `GET /api/solicitudes/?estado=pendiente&adoptante={id}&pagina=1` y la tabla muestra solo las solicitudes pendientes de ese adoptante, con el total de registros filtrado por el backend. Al limpiar vuelven a aparecer todas.
- Resultado obtenido: correcto.
- Capturas: `filtros combinados.png`, `filtro por estado.png`.

## 9. Paginación
- Pasos: con más de 5 solicitudes registradas, abrir Solicitudes y pulsar "Siguiente" y "Anterior".
- Resultado esperado: se muestran 5 registros por página, el indicador "Página 1 de 2" cambia y cada cambio consulta `GET /api/solicitudes/?pagina=N`. Lo mismo ocurre en Mascotas.
- Resultado obtenido: correcto.
- Capturas: `paginacion lista solicitudes.png`, `recargaPaginas.png` (Mascotas).

## 10. Regla de negocio con error 400 visible
- Pasos: en Solicitudes, pulsar "Nueva solicitud", elegir una mascota en estado *Adoptada* y guardar.
- Resultado esperado: el backend responde 400 (R1) y el frontend muestra "No se puede solicitar una mascota ya adoptada." en la alerta y debajo del campo Mascota. No se crea la solicitud.
- Resultado obtenido: correcto.
- Otras reglas verificadas en el mismo módulo:
  - R2: aprobar sin visita realizada → "No se puede aprobar una solicitud sin al menos una visita realizada."
  - R3: aprobar con otra solicitud aprobada para la mascota → "Esta mascota ya tiene una solicitud aprobada".
  - R4: solicitud pendiente repetida → "Este adoptante ya tiene una solicitud pendiente para esta mascota."
  - 409: eliminar una solicitud con visitas → "No se puede eliminar: la solicitud tiene visitas registradas."
- Capturas: `error R1 mascota ya adoptada.png`, `error R2 aprobar sin visita realizada.png`, `Validacion de de aprobar sin una visita previa.png`, `error R3 mascota con solicitud aprobada.png`, `error R4 solicitud pendiente repetida.png`, `error 409 eliminar con visitas.png`.

## 11. Perfil consulta
- Pasos: con el usuario `consulta1`, entrar a `/mascotas/nueva` y guardar.
- Resultado esperado: alerta de 403 "No tiene permiso para esta acción"; en las listas no hay botones de crear, editar ni borrar.
- Resultado obtenido: correcto.
- Capturas: `validacion de error 403.png`, `Perfil de consulta.png`, `perfil consulta solicitudes.png`, `perfil_consulta.png` (Visitas), `perfil_consulta_salud.png` (Salud).

## 12. Ruta privada sin sesión
- Pasos: (a) cerrar sesión, escribir `http://localhost:5173/solicitudes` en la barra de direcciones y revisar la pestaña Network de las herramientas de desarrollo. (b) En una ventana de incógnito, abrir `http://127.0.0.1:8000/api/perfil/`.
- Resultado esperado: (a) se solicita `/solicitudes`, pero `RutaProtegida` redirige a `/login`. (b) La API responde `401 Unauthorized` porque no hay token.
- Resultado obtenido: correcto.
- Capturas: `ruta privada sin sesion redirige a login.png`, `api sin token responde 401.png`.

## Flujo completo entre módulos (criterio "listo cuando")
- Pasos: crear una solicitud → desde su detalle, "Agendar visita" → editar la visita y marcarla *Realizada* → "Aprobar" la solicitud → consultar la mascota.
- Resultado esperado: la solicitud queda *Aprobada* y la mascota aparece como *Adoptada* en el detalle y en Mascotas.
- Resultado obtenido: correcto.
- Capturas: `agendar visita desde detalle.png`, `visita marcada realizada.png`, `solicitud aprobada mascota adoptada.png`.

## Vista móvil
- Pasos: abrir las herramientas de desarrollo (F12) y activar el modo responsive (Ctrl+Shift+M).
- Resultado esperado: el menú se contrae, los filtros se apilan y las tablas se desplazan horizontalmente sin romper la pantalla.
- Resultado obtenido: correcto.
- Capturas: `solicitud en modo responmsivo o movil .png`, `Detalle modo responsivo o movil .png`, `Salud_movill.png`, `Registros_movil.png`, `visitas_movil.png`, `Formulario_de_visitas_Movil.png`.

## Índice de capturas

Todas están en `docs/capturas_frontend/`.

| Tema | Capturas |
|---|---|
| Login y dashboard | `login.png`, `Dashboard.png` |
| Mascotas | `Mascotas.png`, `Nueva Mascota.png`, `Editar Mascota.png`, `Mensaje de confirmacion para eliminar.png`, `validacion de eliminar si no tiene registros.png`, `Validacion de no eliminar si tiene un registro.png`, `validacion de error.png`, `recargaPaginas.png` |
| Adoptantes | `adoptantesAdmin.png`, `adoptantesConsulta.png`, `adoptantesNuevo.png`, `adoptantesEditar.png`, `adoptantesErrorCedula.png` |
| Solicitudes | `filtro por estado.png`, `filtros combinados.png`, `paginacion lista solicitudes.png`, `error R1 mascota ya adoptada.png`, `error R2 aprobar sin visita realizada.png`, `Validacion de de aprobar sin una visita previa.png`, `error R3 mascota con solicitud aprobada.png`, `error R4 solicitud pendiente repetida.png`, `error 409 eliminar con visitas.png`, `agendar visita desde detalle.png`, `visita marcada realizada.png`, `solicitud aprobada mascota adoptada.png` |
| Visitas | `perfil_operador.png`, `perfil_consulta.png`, `visitas_movil.png`, `Formulario_de_visitas_Movil.png` |
| Salud | `Perfil_operador_salud.png`, `perfil_consulta_salud.png`, `Salud_movill.png`, `Registros_movil.png` |
| Perfiles y accesos | `Perfil de operador.png`, `Perfil de consulta.png`, `perfil operador solicitudes.png`, `perfil consulta solicitudes.png`, `validacion de error 403.png`, `ruta privada sin sesion redirige a login.png`, `api sin token responde 401.png` |
| Vista móvil | `solicitud en modo responmsivo o movil .png`, `Detalle modo responsivo o movil .png`, `docs/registros_movil.png` |