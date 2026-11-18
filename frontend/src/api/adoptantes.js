import cliente from './cliente'

export const listarAdoptantes = () => cliente.get('/adoptantes/')
export const obtenerAdoptante = (id) => cliente.get(`/adoptantes/${id}/`)
export const crearAdoptante = (datos) => cliente.post('/adoptantes/', datos)
export const editarAdoptante = (id, datos) => cliente.put(`/adoptantes/${id}/`, datos)
export const eliminarAdoptante = (id) => cliente.delete(`/adoptantes/${id}/`)