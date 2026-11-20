
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listarMascotas } from '../../api/mascotas.js'
import { listarAdoptantes } from '../../api/adoptantes.js'
import {
  listarSolicitudes,
  obtenerVisita,
  crearVisita,
  editarVisita,
} from '../../api/visitas.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'

const VACIO = {
  solicitud: '',
  fecha_hora: '',
  estado: 'programada',
  observaciones: '',
}

const ESTADOS = [
  { valor: 'programada', nombre: 'Programada' },
  { valor: 'realizada', nombre: 'Realizada' },
  { valor: 'cancelada', nombre: 'Cancelada' },
]

function fechaLocal(valor) {
  if (!valor) return ''

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''

  const numero = (n) => String(n).padStart(2, '0')

  return `${fecha.getFullYear()}-${numero(fecha.getMonth() + 1)}-${numero(fecha.getDate())}T${numero(fecha.getHours())}:${numero(fecha.getMinutes())}`
}

function VisitaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puedeCrear, puedeEditar } = usePermisos()
  const permitido = id ? puedeEditar : puedeCrear

  const [datos, setDatos] = useState(VACIO)
  const [solicitudes, setSolicitudes] = useState([])
  const [mascotas, setMascotas] = useState({})
  const [adoptantes, setAdoptantes] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const peticiones = [
          listarSolicitudes({ todos: 1 }),
          listarMascotas({ todos: 1 }),
          listarAdoptantes(),
        ]

        if (id) peticiones.push(obtenerVisita(id))

        const respuestas = await Promise.all(peticiones)
        if (!activo) return

        setSolicitudes(respuestas[0].data)

        setMascotas(Object.fromEntries(
          respuestas[1].data.map((m) => [m.id, m.nombre])
        ))

        setAdoptantes(Object.fromEntries(
          respuestas[2].data.map((a) => [a.id, a.nombre])
        ))

        if (id) {
          const visita = respuestas[3].data

          setDatos({
            solicitud: String(visita.solicitud),
            fecha_hora: fechaLocal(visita.fecha_hora),
            estado: visita.estado,
            observaciones: visita.observaciones || '',
          })
        }
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
  }, [id])

  function cambiar(e) {
    const { name, value } = e.target

    setDatos((actual) => ({
      ...actual,
      [name]: value,
    }))

    setErrores((actual) => ({
      ...actual,
      [name]: undefined,
      non_field_errors: undefined,
    }))
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

    if (!permitido) {
      setError('No tiene permiso para realizar esta operación.')
      return
    }

    const nuevosErrores = {}

    if (!datos.solicitud) {
      nuevosErrores.solicitud = ['Seleccione una solicitud.']
    }

    if (!datos.fecha_hora) {
      nuevosErrores.fecha_hora = ['Seleccione una fecha y hora.']
    } else if (Number.isNaN(new Date(datos.fecha_hora).getTime())) {
      nuevosErrores.fecha_hora = ['La fecha y hora no son válidas.']
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    const payload = {
      solicitud: Number(datos.solicitud),
      fecha_hora: new Date(datos.fecha_hora).toISOString(),
      estado: datos.estado,
      observaciones: datos.observaciones.trim(),
    }

    setGuardando(true)

    try {
      if (id) {
        await editarVisita(id, payload)
      } else {
        await crearVisita(payload)
      }

      navigate('/visitas', {
        state: {
          exito: id
            ? 'Visita actualizada correctamente.'
            : 'Visita registrada correctamente.',
        },
      })
    } catch (err) {
      if (err.response?.status === 400) {
        setErrores(err.response.data || {})
      }

      setError(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Cargando texto="Cargando visita..." />

  return (
    <div className="col-12 col-md-8 col-lg-6">
      <h2 className="mb-3">
        {id ? 'Editar visita' : 'Nueva visita'}
      </h2>

      <Alerta
        mensaje={error}
        onCerrar={() => setError('')}
      />

      <form onSubmit={guardar} noValidate>
        <div className="mb-3">
          <label htmlFor="solicitud" className="form-label">
            Solicitud de adopción
          </label>

          <select
            id="solicitud"
            name="solicitud"
            className={`form-select ${errores.solicitud ? 'is-invalid' : ''}`}
            value={datos.solicitud}
            onChange={cambiar}
            required
          >
            <option value="">Seleccione una solicitud</option>

            {solicitudes.map((solicitud) => (
              <option key={solicitud.id} value={solicitud.id}>
                #{solicitud.id} - {adoptantes[solicitud.adoptante] || 'Adoptante'} / {mascotas[solicitud.mascota] || 'Mascota'} ({solicitud.estado})
              </option>
            ))}
          </select>

          {mostrarError('solicitud')}
        </div>

        <div className="mb-3">
          <label htmlFor="fecha_hora" className="form-label">
            Fecha y hora
          </label>

          <input
            id="fecha_hora"
            name="fecha_hora"
            type="datetime-local"
            className={`form-control ${errores.fecha_hora ? 'is-invalid' : ''}`}
            value={datos.fecha_hora}
            onChange={cambiar}
            required
          />

          {mostrarError('fecha_hora')}
        </div>

        <div className="mb-3">
          <label htmlFor="estado" className="form-label">
            Estado
          </label>

          <select
            id="estado"
            name="estado"
            className={`form-select ${errores.estado ? 'is-invalid' : ''}`}
            value={datos.estado}
            onChange={cambiar}
          >
            {ESTADOS.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.nombre}
              </option>
            ))}
          </select>

          {mostrarError('estado')}
        </div>

        <div className="mb-3">
          <label htmlFor="observaciones" className="form-label">
            Observaciones
          </label>

          <textarea
            id="observaciones"
            name="observaciones"
            rows={4}
            className={`form-control ${errores.observaciones ? 'is-invalid' : ''}`}
            value={datos.observaciones}
            onChange={cambiar}
          />

          {mostrarError('observaciones')}
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={guardando || !permitido}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>

          <Link to="/visitas" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

export default VisitaForm