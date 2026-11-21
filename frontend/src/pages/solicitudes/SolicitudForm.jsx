import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearSolicitud } from '../../api/solicitudes.js'
import { listarMascotas } from '../../api/mascotas.js'
import { listarAdoptantes } from '../../api/adoptantes.js'
import { mensajeError } from '../../utils/errores.js'
import { mensajeSolicitud } from '../../utils/estadosSolicitud.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'

const VACIO = {
  adoptante: '',
  mascota: '',
  motivo: '',
}

const ESTADOS_MASCOTA = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptada: 'Adoptada',
}

function SolicitudForm() {
  const navigate = useNavigate()
  const { puedeCrear } = usePermisos()

  const [datos, setDatos] = useState(VACIO)
  const [mascotas, setMascotas] = useState([])
  const [adoptantes, setAdoptantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  useEffect(() => {
    let activo = true

    Promise.all([listarAdoptantes(), listarMascotas({ todos: 1 })])
      .then(([resAdoptantes, resMascotas]) => {
        if (!activo) return
        setAdoptantes(resAdoptantes.data)
        setMascotas(resMascotas.data)
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

  function cambiar(e) {
    const { name, value } = e.target
    setDatos((actual) => ({ ...actual, [name]: value }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
  }

  function mostrarError(campo) {
    if (!errores[campo]) return null
    return (
      <div className="invalid-feedback">
        {[].concat(errores[campo]).join(' ')}
      </div>
    )
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setErrores({})

    if (!puedeCrear) {
      setError('No tiene permiso para realizar esta operación.')
      return
    }

    const nuevosErrores = {}
    if (!datos.adoptante) nuevosErrores.adoptante = ['Seleccione un adoptante.']
    if (!datos.mascota) nuevosErrores.mascota = ['Seleccione una mascota.']

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setGuardando(true)

    try {
      const resp = await crearSolicitud({
        adoptante: Number(datos.adoptante),
        mascota: Number(datos.mascota),
        motivo: datos.motivo.trim(),
      })

      navigate('/solicitudes', {
        state: { exito: `Solicitud #${resp.data.id} registrada correctamente.` },
      })
    } catch (err) {
      // 400: mascota ya adoptada (campo mascota) o solicitud pendiente repetida
      if (err.response?.status === 400) {
        setErrores(err.response.data || {})
      }
      setError(mensajeSolicitud(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Cargando texto="Cargando formulario..." />

  return (
    <div className="col-12 col-md-8 col-lg-6">
      <h2 className="mb-3">Nueva solicitud de adopción</h2>

      <Alerta mensaje={error} onCerrar={() => setError('')} />

      <form onSubmit={guardar} noValidate>
        <div className="mb-3">
          <label htmlFor="adoptante" className="form-label">Adoptante</label>
          <select
            id="adoptante"
            name="adoptante"
            className={`form-select ${errores.adoptante ? 'is-invalid' : ''}`}
            value={datos.adoptante}
            onChange={cambiar}
            required
          >
            <option value="">Seleccione un adoptante</option>
            {adoptantes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} ({a.cedula})
              </option>
            ))}
          </select>
          {mostrarError('adoptante')}
        </div>

        <div className="mb-3">
          <label htmlFor="mascota" className="form-label">Mascota</label>
          <select
            id="mascota"
            name="mascota"
            className={`form-select ${errores.mascota ? 'is-invalid' : ''}`}
            value={datos.mascota}
            onChange={cambiar}
            required
          >
            <option value="">Seleccione una mascota</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} - {ESTADOS_MASCOTA[m.estado] || m.estado}
              </option>
            ))}
          </select>
          {mostrarError('mascota')}
        </div>

        <div className="mb-3">
          <label htmlFor="motivo" className="form-label">Motivo</label>
          <textarea
            id="motivo"
            name="motivo"
            rows={4}
            className={`form-control ${errores.motivo ? 'is-invalid' : ''}`}
            value={datos.motivo}
            onChange={cambiar}
            placeholder="¿Por qué desea adoptar a esta mascota?"
          />
          {mostrarError('motivo')}
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={guardando || !puedeCrear}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/solicitudes" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

export default SolicitudForm