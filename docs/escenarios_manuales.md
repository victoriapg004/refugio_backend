# Escenarios manuales del frontend

| N.º | Escenario | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 | Login correcto | Entrar con `admin_refugio` y su contraseña | Llega al Dashboard; la barra muestra usuario y rol | Correcto |
| 2 | Contraseña incorrecta | Entrar con una contraseña mala | Alerta "Usuario o contraseña incorrectos"; se queda en el login | Correcto |
| 3 | Logout | Clic en "Cerrar sesión" | Regresa a `/login`; se borran `token` y `perfil` de localStorage | Correcto |
| 7 | Eliminar mascota | (a) Eliminar una mascota sin solicitudes. (b) Eliminar una con solicitudes | (a) Pide confirmación y la elimina. (b) Mensaje del 409: "No se puede eliminar: la mascota tiene solicitudes o registros de vacunación." | Correcto |
| 11 | Perfil consulta | Con `consulta_refugio`, entrar a `/mascotas/nueva` y guardar | Alerta de 403 "No tiene permiso para esta acción"; en la lista no hay botones de crear ni borrar | Correcto |

Capturas en `docs/capturas_frontend/`: `login.png`, `dashboard.png`, `mascotas.png`, `error_400.png` y `error_403.png`.