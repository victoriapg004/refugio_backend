function Paginacion({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null
  return (
    <nav aria-label="Paginación">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${paginaActual <= 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onCambiar(paginaActual - 1)}
            disabled={paginaActual <= 1}
          >
            Anterior
          </button>
        </li>
        <li className="page-item active">
          <span className="page-link">
            Página {paginaActual} de {totalPaginas}
          </span>
        </li>
        <li className={`page-item ${paginaActual >= totalPaginas ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onCambiar(paginaActual + 1)}
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Paginacion