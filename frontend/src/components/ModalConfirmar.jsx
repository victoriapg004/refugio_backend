function ModalConfirmar({
  visible,
  titulo = 'Confirmar acción',
  mensaje,
  textoConfirmar = 'Eliminar',
  onConfirmar,
  onCancelar,
}) {
  if (!visible) return null
  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onCancelar}
              ></button>
            </div>
            <div className="modal-body">{mensaje}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirmar}>
                {textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  )
}

export default ModalConfirmar