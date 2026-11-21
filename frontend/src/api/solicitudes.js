import cliente from './cliente.js'

export const listarSolicitudes = (params = {}) => cliente.get('/solicitudes/', { params })
export const obtenerSolicitud = (id) => cliente.get(`/solicitudes/${id}/`)
export const crearSolicitud = (datos) => cliente.post('/solicitudes/', datos)
export const cambiarEstadoSolicitud = (id, estado) =>
  cliente.patch(`/solicitudes/${id}/`, { estado })
export const eliminarSolicitud = (id) => cliente.delete(`/solicitudes/${id}/`)
