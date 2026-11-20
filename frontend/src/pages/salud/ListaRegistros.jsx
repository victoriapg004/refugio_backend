
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listarRegistros, listarVacunas, eliminarRegistro } from '../../api/salud.js'
import { listarMascotas } from '../../api/mascotas.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'

function ListaRegistros() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const location = useLocation()

  const [registros, setRegistros] = useState([])
  const [mascotas, setMascotas] = useState({})
  const [vacunas, setVacunas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const [resRegistros, resMascotas, resVacunas] = await Promise.all([
          listarRegistros(),
          listarMascotas({ todos: 1 }),
          listarVacunas(),
        ])

        if (!activo) return

        const mapaMascotas = Object.fromEntries(
          resMascotas.data.map((m) => [m.id, m.nombre])
        )

        const mapaVacunas = Object.fromEntries(
          resVacunas.data.map((v) => [v.id, v.nombre])
        )

        setRegistros(resRegistros.data)
        setMascotas(mapaMascotas)
        setVacunas(mapaVacunas)
      } catch (err) {
        if (activo) setError(mensajeError(err))
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

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
      await eliminarRegistro(aEliminar.id)
      setRegistros((actuales) =>
        actuales.filter((r) => r.id !== aEliminar.id)
      )
      setExito('Registro de vacunación eliminado correctamente.')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setAEliminar(null)
      setEliminando(false)
    }
  }

  const hayAcciones = puedeEditar || puedeBorrar

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Registros de vacunación</h2>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/salud" className="btn btn-outline-secondary">
            Volver a vacunas
          </Link>

          {puedeCrear && (
            <Link to="/salud/registros/nuevo" className="btn btn-primary">
              Nuevo registro
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
        <Cargando texto="Cargando registros..." />
      ) : registros.length === 0 ? (
        <p>No hay registros de vacunación.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Vacuna</th>
                <th>Fecha de aplicación</th>
                <th>Observaciones</th>
                {hayAcciones && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    {mascotas[registro.mascota] || `Mascota #${registro.mascota}`}
                  </td>
                  <td>
                    {vacunas[registro.vacuna] || `Vacuna #${registro.vacuna}`}
                  </td>
                  <td>{registro.fecha_aplicacion}</td>
                  <td>{registro.observaciones || '-'}</td>

                  {hayAcciones && (
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {puedeEditar && (
                          <Link
                            to={`/salud/registros/${registro.id}/editar`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Editar
                          </Link>
                        )}

                        {puedeBorrar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setAEliminar(registro)}
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
        titulo="Eliminar registro"
        mensaje="¿Seguro que deseas eliminar este registro de vacunación?"
        onConfirmar={confirmarEliminar}
        onCancelar={() => {
          if (!eliminando) setAEliminar(null)
        }}
      />
    </div>
  )
}

export default ListaRegistros
