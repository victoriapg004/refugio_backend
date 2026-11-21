import { mensajeError } from './errores.js'

export const ESTADOS_SOLICITUD = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

export const COLORES_ESTADO = {
  pendiente: 'bg-warning text-dark',
  aprobada: 'bg-success',
  rechazada: 'bg-danger',
}

// Muestra los errores de las reglas del backend sin el nombre del campo
// (por ejemplo "No se puede aprobar una solicitud sin al menos una visita realizada.")
export function mensajeSolicitud(err) {
  const data = err.response?.data

  if (err.response?.status === 400 && data && typeof data === 'object') {
    return Object.values(data).flat().join(' ')
  }

  return mensajeError(err)
}
