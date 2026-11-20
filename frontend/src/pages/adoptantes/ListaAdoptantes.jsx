import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarAdoptantes, eliminarAdoptante } from '../../api/adoptantes'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Cargando from '../../components/Cargando.jsx'
import EstadoVacio from '../../components/EstadoVacio.jsx'
import Alerta from '../../components/Alerta.jsx'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'

function ListaAdoptantes() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const [adoptantes, setAdoptantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [aBorrar, setABorrar] = useState(null)

  useEffect(() => {
    listarAdoptantes()
      .then((respuesta) => setAdoptantes(respuesta.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  const confirmarBorrado = async () => {
    setError('')
    setExito('')
    try {
      await eliminarAdoptante(aBorrar.id)
      setAdoptantes((actuales) => actuales.filter((a) => a.id !== aBorrar.id))
      setExito('Adoptante eliminado correctamente.')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setABorrar(null)
    }
  }

  const hayAcciones = puedeEditar || puedeBorrar

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Adoptantes</h2>
        {puedeCrear && (
          <Link to="/adoptantes/nueva" className="btn btn-primary">
            Nuevo adoptante
          </Link>
        )}
      </div>

      <Alerta tipo="danger" mensaje={error} onCerrar={() => setError('')} />
      <Alerta tipo="success" mensaje={exito} onCerrar={() => setExito('')} />

      {cargando ? (
        <Cargando texto="Cargando adoptantes..." />
      ) : adoptantes.length === 0 ? (
        <EstadoVacio mensaje="No hay adoptantes registrados." />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Teléfono</th>
                {hayAcciones && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {adoptantes.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.cedula}</td>
                  <td>{a.correo}</td>
                  <td>{a.telefono}</td>
                  {hayAcciones && (
                    <td>
                      {puedeEditar && (
                        <Link
                          to={`/adoptantes/${a.id}/editar`}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          Editar
                        </Link>
                      )}
                      {puedeBorrar && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setABorrar(a)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalConfirmar
        visible={aBorrar !== null}
        titulo="Eliminar adoptante"
        mensaje={`¿Seguro que deseas eliminar a ${aBorrar?.nombre}?`}
        onConfirmar={confirmarBorrado}
        onCancelar={() => setABorrar(null)}
      />
    </div>
  )
}

export default ListaAdoptantes