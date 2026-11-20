
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listarVisitas, listarSolicitudes, eliminarVisita } from '../../api/visitas.js'
import { listarMascotas } from '../../api/mascotas.js'
import { listarAdoptantes } from '../../api/adoptantes.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'

const ESTADOS = {
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

function ListaVisitas() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const location = useLocation()

  const [visitas, setVisitas] = useState([])
  const [solicitudes, setSolicitudes] = useState({})
  const [mascotas, setMascotas] = useState({})
  const [adoptantes, setAdoptantes] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const [resVisitas, resSolicitudes, resMascotas, resAdoptantes] =
          await Promise.all([
            listarVisitas(),
            listarSolicitudes({ todos: 1 }),
            listarMascotas({ todos: 1 }),
            listarAdoptantes(),
          ])

        if (!activo) return

        setVisitas(resVisitas.data)

        setSolicitudes(Object.fromEntries(
          resSolicitudes.data.map((s) => [s.id, s])
        ))

        setMascotas(Object.fromEntries(
          resMascotas.data.map((m) => [m.id, m.nombre])
        ))

        setAdoptantes(Object.fromEntries(
          resAdoptantes.data.map((a) => [a.id, a.nombre])
        ))

        setError('')
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

  function nombreSolicitud(id) {
    const solicitud = solicitudes[id]

    if (!solicitud) return `Solicitud #${id}`

    const adoptante = adoptantes[solicitud.adoptante] || 'Adoptante'
    const mascota = mascotas[solicitud.mascota] || 'Mascota'

    return `#${id} - ${adoptante} / ${mascota}`
  }

  function mostrarFecha(valor) {
    if (!valor) return '-'

    return new Date(valor).toLocaleString('es-CR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  async function confirmarEliminar() {
    if (!aEliminar || eliminando) return

    setEliminando(true)
    setError('')
    setExito('')

    try {
      await eliminarVisita(aEliminar.id)

      setVisitas((actuales) =>
        actuales.filter((visita) => visita.id !== aEliminar.id)
      )

      setExito('Visita eliminada correctamente.')
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
        <h2 className="mb-0">Visitas</h2>

        {puedeCrear && (
          <Link to="/visitas/nueva" className="btn btn-primary">
            Nueva visita
          </Link>
        )}
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
        <Cargando texto="Cargando visitas..." />
      ) : visitas.length === 0 ? (
        <p>No hay visitas registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Observaciones</th>
                {hayAcciones && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {visitas.map((visita) => (
                <tr key={visita.id}>
                  <td>{nombreSolicitud(visita.solicitud)}</td>
                  <td>{mostrarFecha(visita.fecha_hora)}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {ESTADOS[visita.estado] || visita.estado}
                    </span>
                  </td>
                  <td>{visita.observaciones || '-'}</td>

                  {hayAcciones && (
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {puedeEditar && (
                          <Link
                            to={`/visitas/${visita.id}/editar`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Editar
                          </Link>
                        )}

                        {puedeBorrar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setAEliminar(visita)}
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
        titulo="Eliminar visita"
        mensaje={`¿Seguro que deseas eliminar la visita #${aEliminar?.id}?`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => {
          if (!eliminando) setAEliminar(null)
        }}
      />
    </div>
  )
}

export default ListaVisitas
