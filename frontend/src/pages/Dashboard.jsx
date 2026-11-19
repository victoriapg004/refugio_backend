import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import cliente from '../api/cliente'
import { mensajeError } from '../utils/errores.js'
import Alerta from '../components/Alerta.jsx'
import Cargando from '../components/Cargando.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'

const MODULOS = [
  { ruta: '/mascotas', texto: 'Mascotas', descripcion: 'Registro y estado de las mascotas' },
  { ruta: '/adoptantes', texto: 'Adoptantes', descripcion: 'Personas interesadas en adoptar' },
  { ruta: '/solicitudes', texto: 'Solicitudes', descripcion: 'Solicitudes de adopción' },
  { ruta: '/visitas', texto: 'Visitas', descripcion: 'Visitas programadas' },
  { ruta: '/salud', texto: 'Salud', descripcion: 'Vacunas y registros de salud' },
]

const ETIQUETA_ESPECIE = { perro: 'Perros', gato: 'Gatos' }

function formatearFecha(valor) {
  return new Date(valor).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function Dashboard() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cliente
      .get('/estadisticas/')
      .then((resp) => setDatos(resp.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <Cargando />

  return (
    <>
      <h2 className="mb-3">Dashboard</h2>
      <Alerta mensaje={error} onCerrar={() => setError('')} />

      {datos && (
        <div className="row g-3 mb-4">
          {/* Mascotas disponibles por especie */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-header">Mascotas disponibles</div>
              <div className="card-body">
                {datos.mascotas_disponibles_por_especie.length === 0 ? (
                  <p className="text-muted mb-0">No hay mascotas disponibles.</p>
                ) : (
                  datos.mascotas_disponibles_por_especie.map((e) => (
                    <div key={e.especie} className="d-flex justify-content-between">
                      <span>{ETIQUETA_ESPECIE[e.especie] || e.especie}</span>
                      <strong className="fs-4">{e.total}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mascota con más solicitudes */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-header">Mascota con más solicitudes</div>
              <div className="card-body">
                {datos.mascota_con_mas_solicitudes ? (
                  <>
                    <p className="fs-4 fw-bold mb-0">
                      {datos.mascota_con_mas_solicitudes.nombre}
                    </p>
                    <p className="text-muted mb-0">
                      {datos.mascota_con_mas_solicitudes.total_solicitudes} solicitud(es)
                    </p>
                  </>
                ) : (
                  <p className="text-muted mb-0">Aún no hay solicitudes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Vacunas más aplicadas */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-header">Vacunas más aplicadas</div>
              <ul className="list-group list-group-flush">
                {datos.vacunas_mas_aplicadas.length === 0 ? (
                  <li className="list-group-item text-muted">Sin aplicaciones.</li>
                ) : (
                  datos.vacunas_mas_aplicadas.map((v) => (
                    <li
                      key={v.id}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>{v.nombre}</span>
                      <span className="badge text-bg-primary">{v.total_aplicaciones}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Próximas visitas */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100">
              <div className="card-header">Próximas visitas</div>
              <ul className="list-group list-group-flush">
                {datos.proximas_visitas.length === 0 ? (
                  <li className="list-group-item text-muted">No hay visitas próximas.</li>
                ) : (
                  datos.proximas_visitas.map((v) => (
                    <li key={v.id} className="list-group-item">
                      <div className="fw-semibold">{formatearFecha(v.fecha_hora)}</div>
                      <small className="text-muted">
                        {v.adoptante} con {v.mascota}
                      </small>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!datos && !error && <EstadoVacio mensaje="No hay estadísticas para mostrar." />}

      <h5 className="mb-3">Módulos</h5>
      <div className="row g-3">
        {MODULOS.map((m) => (
          <div className="col-12 col-md-6 col-lg-4" key={m.ruta}>
            <Link to={m.ruta} className="text-decoration-none">
              <div className="card h-100 border-primary">
                <div className="card-body">
                  <h5 className="card-title text-primary">{m.texto}</h5>
                  <p className="card-text text-muted mb-0">{m.descripcion}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default Dashboard