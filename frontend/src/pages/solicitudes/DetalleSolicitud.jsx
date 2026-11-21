import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { obtenerSolicitud, cambiarEstadoSolicitud } from '../../api/solicitudes.js'
import { listarVisitas } from '../../api/visitas.js'
import { obtenerMascota } from '../../api/mascotas.js'
import { obtenerAdoptante } from '../../api/adoptantes.js'
import { mensajeError } from '../../utils/errores.js'
import {
  ESTADOS_SOLICITUD,
  COLORES_ESTADO,
  mensajeSolicitud,
} from '../../utils/estadosSolicitud.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'
import EstadoVacio from '../../components/EstadoVacio.jsx'

const ESTADOS_MASCOTA = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptada: 'Adoptada',
}

const ESTADOS_VISITA = {
  programada: 'Programada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

function mostrarFecha(valor) {
  if (!valor) return '-'
  return new Date(valor).toLocaleString('es-CR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function DetalleSolicitud() {
  const { id } = useParams()
  const { puedeCrear, puedeEditar } = usePermisos()
  const location = useLocation()

  const [solicitud, setSolicitud] = useState(null)
  const [adoptante, setAdoptante] = useState(null)
  const [mascota, setMascota] = useState(null)
  const [visitas, setVisitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [procesando, setProcesando] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const [resSolicitud, resVisitas] = await Promise.all([
          obtenerSolicitud(id),
          listarVisitas({ solicitud: id }),
        ])

        // Se vuelve a consultar la mascota para ver su estado actualizado
        const [resAdoptante, resMascota] = await Promise.all([
          obtenerAdoptante(resSolicitud.data.adoptante),
          obtenerMascota(resSolicitud.data.mascota),
        ])

        if (!activo) return
        setSolicitud(resSolicitud.data)
        setVisitas(resVisitas.data)
        setAdoptante(resAdoptante.data)
        setMascota(resMascota.data)
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
  }, [id, recarga])

  async function cambiarEstado(nuevoEstado) {
    setProcesando(true)
    setError('')
    setExito('')

    try {
      await cambiarEstadoSolicitud(id, nuevoEstado)
      setExito(
        nuevoEstado === 'aprobada'
          ? 'Solicitud aprobada. La mascota quedó como adoptada.'
          : 'Solicitud rechazada.'
      )
      setRecarga((n) => n + 1)
    } catch (err) {
      // 400: aprobar sin visita realizada o mascota con otra solicitud aprobada
      setError(mensajeSolicitud(err))
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) return <Cargando texto="Cargando solicitud..." />

  if (!solicitud) {
    return (
      <>
        <Alerta mensaje={error} />
        <Link to="/solicitudes" className="btn btn-outline-secondary">
          Volver a solicitudes
        </Link>
      </>
    )
  }

  const pendiente = solicitud.estado === 'pendiente'

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Solicitud #{solicitud.id}</h2>
        <Link to="/solicitudes" className="btn btn-outline-secondary">
          Volver a solicitudes
        </Link>
      </div>

      <Alerta mensaje={error} onCerrar={() => setError('')} />
      <Alerta tipo="success" mensaje={exito} onCerrar={() => setExito('')} />

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Adoptante</div>
              <div className="fw-semibold">{adoptante?.nombre}</div>
              <div className="small">
                Cédula: {adoptante?.cedula} · {adoptante?.correo}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Mascota</div>
              <div className="fw-semibold">
                {mascota?.nombre}{' '}
                <span className="text-capitalize">({mascota?.especie})</span>
              </div>
              <div className="small">
                Estado de la mascota: {ESTADOS_MASCOTA[mascota?.estado] || mascota?.estado}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Fecha</div>
              <div>{solicitud.fecha}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Estado</div>
              <span className={`badge ${COLORES_ESTADO[solicitud.estado] || 'bg-secondary'}`}>
                {ESTADOS_SOLICITUD[solicitud.estado] || solicitud.estado}
              </span>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Motivo</div>
              <div>{solicitud.motivo || '-'}</div>
            </div>
          </div>

          {puedeEditar && pendiente && (
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="btn btn-success"
                disabled={procesando}
                onClick={() => cambiarEstado('aprobada')}
              >
                Aprobar
              </button>
              <button
                type="button"
                className="btn btn-outline-warning"
                disabled={procesando}
                onClick={() => cambiarEstado('rechazada')}
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <h4 className="mb-0">Visitas de esta solicitud</h4>
        {puedeCrear && solicitud.estado !== 'rechazada' && (
          <Link
            to={`/visitas/nueva?solicitud=${solicitud.id}`}
            className="btn btn-primary"
          >
            Agendar visita
          </Link>
        )}
      </div>

      {visitas.length === 0 ? (
        <EstadoVacio mensaje="Esta solicitud todavía no tiene visitas." />
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Estado</th>
                <th>Observaciones</th>
                {puedeEditar && <th className="text-end">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => (
                <tr key={v.id}>
                  <td>{mostrarFecha(v.fecha_hora)}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {ESTADOS_VISITA[v.estado] || v.estado}
                    </span>
                  </td>
                  <td>{v.observaciones || '-'}</td>
                  {puedeEditar && (
                    <td className="text-end">
                      <Link
                        to={`/visitas/${v.id}/editar?solicitud=${solicitud.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Editar
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default DetalleSolicitud
