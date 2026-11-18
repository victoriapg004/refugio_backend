function EstadoVacio({ mensaje = 'No hay registros para mostrar.' }) {
  return (
    <div className="text-center text-muted py-5 border rounded bg-light">
      {mensaje}
    </div>
  )
}

export default EstadoVacio