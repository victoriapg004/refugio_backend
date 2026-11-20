function Alerta({ tipo = 'danger', mensaje, onCerrar }) {
  if (!mensaje) return null
  return (
    <div className={`alert alert-${tipo} alert-dismissible`} role="alert">
      {mensaje}
      {onCerrar && (
        <button
          type="button"
          className="btn-close"
          aria-label="Cerrar"
          onClick={onCerrar}
        ></button>
      )}
    </div>
  )
}

export default Alerta