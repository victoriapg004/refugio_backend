import cliente from './cliente'

export const listarMascotas = (params) => cliente.get('/mascotas/', { params })
export const obtenerMascota = (id) => cliente.get(`/mascotas/${id}/`)
export const crearMascota = (datos) => cliente.post('/mascotas/', datos)
export const editarMascota = (id, datos) => cliente.put(`/mascotas/${id}/`, datos)
export const eliminarMascota = (id) => cliente.delete(`/mascotas/${id}/`)