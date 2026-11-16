import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarAdoptantes } from '../../api/adoptantes'

function ListaAdoptantes() {
  const [adoptantes, setAdoptantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarAdoptantes()
      .then((respuesta) => setAdoptantes(respuesta.data))
      .catch(() => setError('No se pudo cargar la lista de adoptantes.'))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Adoptantes</h2>
        <Link to="/adoptantes/nueva" className="btn btn-primary">
          Nuevo adoptante
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : adoptantes.length === 0 ? (
        <p className="text-muted">No hay adoptantes registrados.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adoptantes.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.cedula}</td>
                  <td>{a.correo}</td>
                  <td>{a.telefono}</td>
                  <td>
                    <Link to={`/adoptantes/${a.id}/editar`} className="btn btn-sm btn-outline-secondary me-2">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListaAdoptantes