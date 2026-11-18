function textoDe(valor) {
  return Array.isArray(valor) ? valor.join(', ') : String(valor)
}

export function mensajeError(error) {
  if (!error.response) return 'No se pudo conectar con el servidor'
  const { status, data } = error.response

  if (status === 400) {
    if (data && typeof data === 'object') {
      return Object.entries(data)
        .map(([campo, msgs]) =>
          ['non_field_errors', 'error', 'detail'].includes(campo)
            ? textoDe(msgs)
            : `${campo}: ${textoDe(msgs)}`
        )
        .join(' | ')
    }
    return 'Los datos enviados no son válidos'
  }
  if (status === 401) return data?.detail || 'Su sesión no es válida. Inicie sesión de nuevo'
  if (status === 403) return 'No tiene permiso para esta acción'
  if (status === 404) return data?.error || 'No se encontró el registro solicitado'
  if (status === 409) return data?.error || 'No se puede completar la acción por datos relacionados'
  return 'Ocurrió un error inesperado'
}