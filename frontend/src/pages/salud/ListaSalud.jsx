
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listarVacunas, eliminarVacuna } from '../../api/salud.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'

function ListaSalud() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const location = useLocation()

  const [vacunas, setVacunas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    let activo = true

    listarVacunas()
      .then((respuesta) => {
        if (activo) setVacunas(respuesta.data)
      })
      .catch((err) => {
        if (activo) setError(mensajeError(err))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  async function confirmarEliminar() {
    if (!aEliminar || eliminando) return

    setEliminando(true)
    setError('')
    setExito('')

    try {
      await eliminarVacuna(aEliminar.id)

      setVacunas((actuales) =>
        actuales.filter((vacuna) => vacuna.id !== aEliminar.id)
      )

      setExito('Vacuna eliminada correctamente.')
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          err.response.data?.error ||
          'No se puede eliminar una vacuna que ya fue aplicada.'
        )
      } else {
        setError(mensajeError(err))
      }
    } finally {
      setAEliminar(null)
      setEliminando(false)
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Salud - Vacunas</h2>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/salud/registros" className="btn btn-outline-primary">
            Registros de vacunación
          </Link>

          {puedeCrear && (
            <Link to="/salud/vacunas/nueva" className="btn btn-primary">
              Nueva vacuna
            </Link>
          )}
        </div>

      </div>

      <Alerta
        mensaje={error}
        onCerrar={() => setError('')}
      />

      <Alerta
        tipo="success"
        mensaje={exito}
        onCerrar={() => setExito('')}
      />

      {cargando ? (
        <Cargando />
      ) : vacunas.length === 0 ? (
        <p>No hay vacunas registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                {(puedeEditar || puedeBorrar) && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {vacunas.map((vacuna) => (
                <tr key={vacuna.id}>
                  <td>{vacuna.nombre}</td>
                  <td>{vacuna.descripcion || '-'}</td>

                  {(puedeEditar || puedeBorrar) && (
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {puedeEditar && (
                          <Link
                            to={`/salud/vacunas/${vacuna.id}/editar`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Editar
                          </Link>
                        )}

                        {puedeBorrar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setAEliminar(vacuna)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalConfirmar
        visible={aEliminar !== null}
        titulo="Eliminar vacuna"
        mensaje={`¿Seguro que deseas eliminar la vacuna ${aEliminar?.nombre}?`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  )
}

export default ListaSalud
