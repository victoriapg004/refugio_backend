
import cliente from './cliente.js'

export const listarVisitas = (params = {}) => cliente.get('/visitas/', { params })
export const obtenerVisita = (id) => cliente.get(`/visitas/${id}/`)
export const crearVisita = (datos) => cliente.post('/visitas/', datos)
export const editarVisita = (id, datos) => cliente.put(`/visitas/${id}/`, datos)
export const eliminarVisita = (id) => cliente.delete(`/visitas/${id}/`)

export const listarSolicitudes = (params = {}) =>
  cliente.get('/solicitudes/', { params })
