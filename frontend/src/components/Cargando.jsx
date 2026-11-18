function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary me-2" role="status"></div>
      <span>{texto}</span>
    </div>
  )
}

export default Cargando