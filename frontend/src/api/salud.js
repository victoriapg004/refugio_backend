import cliente from './cliente.js'

export const listarVacunas = () => cliente.get('/salud/vacunas/')
export const obtenerVacuna = (id) => cliente.get(`/salud/vacunas/${id}/`)
export const crearVacuna = (datos) => cliente.post('/salud/vacunas/', datos)
export const editarVacuna = (id, datos) => cliente.put(`/salud/vacunas/${id}/`, datos)
export const eliminarVacuna = (id) => cliente.delete(`/salud/vacunas/${id}/`)

export const listarRegistros = () => cliente.get('/salud/registros/')
export const obtenerRegistro = (id) => cliente.get(`/salud/registros/${id}/`)
export const crearRegistro = (datos) => cliente.post('/salud/registros/', datos)
export const editarRegistro = (id, datos) => cliente.put(`/salud/registros/${id}/`, datos)
export const eliminarRegistro = (id) => cliente.delete(`/salud/registros/${id}/`)
