import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  listarSolicitudes,
  cambiarEstadoSolicitud,
  eliminarSolicitud,
} from '../../api/solicitudes.js'
import { listarMascotas } from '../../api/mascotas.js'
import { listarAdoptantes } from '../../api/adoptantes.js'
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
import ModalConfirmar from '../../components/ModalConfirmar.jsx'
import Paginacion from '../../components/Paginacion.jsx'

function ListaSolicitudes() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const location = useLocation()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [recarga, setRecarga] = useState(0)

  // Diccionarios id -> nombre para mostrar nombres en vez de números
  const [mascotas, setMascotas] = useState({})
  const [adoptantes, setAdoptantes] = useState({})

  // Filtros que se mandan al backend
  const [estado, setEstado] = useState('')
  const [adoptante, setAdoptante] = useState('')
  const [mascota, setMascota] = useState('')
  const [pagina, setPagina] = useState(1)

  const [aEliminar, setAEliminar] = useState(null)
  const [procesando, setProcesando] = useState(null)

  // Listas completas (?todos=1) para los selects y los diccionarios
  useEffect(() => {
    let cancelado = false

    Promise.all([listarMascotas({ todos: 1 }), listarAdoptantes()])
      .then(([resMascotas, resAdoptantes]) => {
        if (cancelado) return
        setMascotas(Object.fromEntries(resMascotas.data.map((m) => [m.id, m.nombre])))
        setAdoptantes(Object.fromEntries(resAdoptantes.data.map((a) => [a.id, a.nombre])))
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err))
      })

    return () => {
      cancelado = true
    }
  }, [])

  // Solicitudes paginadas con los filtros
  useEffect(() => {
    const params = { pagina }
    if (estado) params.estado = estado
    if (adoptante) params.adoptante = adoptante
    if (mascota) params.mascota = mascota

    let cancelado = false

    listarSolicitudes(params)
      .then((resp) => {
        if (cancelado) return
        setDatos(resp.data)
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [estado, adoptante, mascota, pagina, recarga])

  // Cada cambio de filtro vuelve a la página 1
  function cambiarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
    setCargando(true)
  }

  function limpiarFiltros() {
    setEstado('')
    setAdoptante('')
    setMascota('')
    setPagina(1)
    setCargando(true)
  }

  function cambiarPagina(nueva) {
    setPagina(nueva)
    setCargando(true)
  }

  async function cambiarEstado(solicitud, nuevoEstado) {
    setProcesando(solicitud.id)
    setError('')
    setExito('')

    try {
      await cambiarEstadoSolicitud(solicitud.id, nuevoEstado)
      setExito(
        nuevoEstado === 'aprobada'
          ? `Solicitud #${solicitud.id} aprobada. La mascota quedó como adoptada.`
          : `Solicitud #${solicitud.id} rechazada.`
      )
      setCargando(true)
      setRecarga((n) => n + 1)
    } catch (err) {
      // 400: aprobar sin visita realizada o mascota con otra solicitud aprobada
      setError(mensajeSolicitud(err))
    } finally {
      setProcesando(null)
    }
  }

  async function confirmarEliminar() {
    const solicitud = aEliminar
    setAEliminar(null)
    setError('')
    setExito('')

    try {
      await eliminarSolicitud(solicitud.id)
      setExito(`Se eliminó la solicitud #${solicitud.id}.`)
      setCargando(true)
      setRecarga((n) => n + 1)
    } catch (err) {
      // 409: la solicitud tiene visitas registradas
      setError(mensajeError(err))
    }
  }

  const lista = datos?.resultados || []
  const hayFiltros = estado || adoptante || mascota

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Solicitudes de adopción</h2>
        {puedeCrear && (
          <Link to="/solicitudes/nueva" className="btn btn-primary">
            Nueva solicitud
          </Link>
        )}
      </div>

      <Alerta mensaje={error} onCerrar={() => setError('')} />
      <Alerta tipo="success" mensaje={exito} onCerrar={() => setExito('')} />

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => cambiarFiltro(setEstado, e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS_SOLICITUD).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select"
            aria-label="Filtrar por adoptante"
            value={adoptante}
            onChange={(e) => cambiarFiltro(setAdoptante, e.target.value)}
          >
            <option value="">Todos los adoptantes</option>
            {Object.entries(adoptantes).map(([id, nombre]) => (
              <option key={id} value={id}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            aria-label="Filtrar por mascota"
            value={mascota}
            onChange={(e) => cambiarFiltro(setMascota, e.target.value)}
          >
            <option value="">Todas las mascotas</option>
            {Object.entries(mascotas).map(([id, nombre]) => (
              <option key={id} value={id}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-2 d-grid">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {cargando ? (
        <Cargando texto="Cargando solicitudes..." />
      ) : lista.length === 0 ? (
        <EstadoVacio mensaje="No hay solicitudes que coincidan con los filtros." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Adoptante</th>
                  <th>Mascota</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{adoptantes[s.adoptante] || `Adoptante #${s.adoptante}`}</td>
                    <td>{mascotas[s.mascota] || `Mascota #${s.mascota}`}</td>
                    <td>{s.fecha}</td>
                    <td>
                      <span className={`badge ${COLORES_ESTADO[s.estado] || 'bg-secondary'}`}>
                        {ESTADOS_SOLICITUD[s.estado] || s.estado}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        <Link
                          to={`/solicitudes/${s.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Ver detalle
                        </Link>
                        {puedeEditar && s.estado === 'pendiente' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              disabled={procesando === s.id}
                              onClick={() => cambiarEstado(s, 'aprobada')}
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              disabled={procesando === s.id}
                              onClick={() => cambiarEstado(s, 'rechazada')}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {puedeBorrar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setAEliminar(s)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small className="text-muted">{datos.total_registros} registro(s)</small>
            <Paginacion
              paginaActual={datos.pagina_actual}
              totalPaginas={datos.total_paginas}
              onCambiar={cambiarPagina}
            />
          </div>
        </>
      )}

      <ModalConfirmar
        visible={!!aEliminar}
        titulo="Eliminar solicitud"
        mensaje={`¿Seguro que desea eliminar la solicitud #${aEliminar?.id}? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}

export default ListaSolicitudes
