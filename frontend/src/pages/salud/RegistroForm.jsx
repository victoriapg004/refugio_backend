
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listarMascotas } from '../../api/mascotas.js'
import {
  listarVacunas,
  obtenerRegistro,
  crearRegistro,
  editarRegistro,
} from '../../api/salud.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'

const VACIO = {
  mascota: '',
  vacuna: '',
  fecha_aplicacion: '',
  observaciones: '',
}

function RegistroForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puedeCrear, puedeEditar } = usePermisos()
  const permitido = id ? puedeEditar : puedeCrear

  const [datos, setDatos] = useState(VACIO)
  const [mascotas, setMascotas] = useState([])
  const [vacunas, setVacunas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  const hoy = new Date()
  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const peticiones = [
          listarMascotas({ todos: 1 }),
          listarVacunas(),
        ]

        if (id) peticiones.push(obtenerRegistro(id))

        const respuestas = await Promise.all(peticiones)
        if (!activo) return

        setMascotas(respuestas[0].data)
        setVacunas(respuestas[1].data)

        if (id) {
          const registro = respuestas[2].data
          setDatos({
            mascota: String(registro.mascota),
            vacuna: String(registro.vacuna),
            fecha_aplicacion: registro.fecha_aplicacion || '',
            observaciones: registro.observaciones || '',
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
      setError('No tienes permiso para esta operación.')
      return
    }

    const nuevosErrores = {}

    if (!datos.mascota) {
      nuevosErrores.mascota = ['Selecciona una mascota.']
    }

    if (!datos.vacuna) {
      nuevosErrores.vacuna = ['Selecciona una vacuna.']
    }

    if (!datos.fecha_aplicacion) {
      nuevosErrores.fecha_aplicacion = ['Selecciona una fecha.']
    } else if (datos.fecha_aplicacion > fechaHoy) {
      nuevosErrores.fecha_aplicacion = [
        'La fecha de aplicación no puede ser futura.',
      ]
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    const payload = {
      mascota: Number(datos.mascota),
      vacuna: Number(datos.vacuna),
      fecha_aplicacion: datos.fecha_aplicacion,
      observaciones: datos.observaciones,
    }

    setGuardando(true)

    try {
      if (id) {
        await editarRegistro(id, payload)
      } else {
        await crearRegistro(payload)
      }

      navigate('/salud/registros', {
        state: {
          exito: id
            ? 'Registro actualizado correctamente.'
            : 'Vacunación registrada correctamente.',
        },
      })
    } catch (err) {
      if (err.response?.status === 400) {
        const recibidos = err.response.data || {}
        const duplicado = [
          ...[].concat(recibidos.non_field_errors || []),
          ...[].concat(recibidos.error || []),
        ].some((mensaje) =>
          /unique|already exists|únic|duplicad/i.test(String(mensaje))
        )

        if (duplicado) {
          setErrores({
            ...recibidos,
            non_field_errors: [
              'Ya existe un registro de esta vacuna para la misma mascota y fecha.',
            ],
          })
          setError('Ya existe un registro de esta vacuna para la misma mascota y fecha.')
        } else {
          setErrores(recibidos)
          setError(mensajeError(err))
        }
      } else {
        setError(mensajeError(err))
      }
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <Cargando texto="Cargando formulario..." />

  return (
    <div className="col-12 col-md-8 col-lg-6">
      <h2 className="mb-3">
        {id ? 'Editar registro' : 'Nueva vacunación'}
      </h2>

      <Alerta mensaje={error} onCerrar={() => setError('')} />

      <form onSubmit={guardar} noValidate>
        <div className="mb-3">
          <label htmlFor="mascota" className="form-label">
            Mascota
          </label>

          <select
            id="mascota"
            name="mascota"
            className={`form-select ${errores.mascota ? 'is-invalid' : ''}`}
            value={datos.mascota}
            onChange={cambiar}
            required
          >
            <option value="">Seleccione una mascota</option>
            {mascotas.map((mascota) => (
              <option key={mascota.id} value={mascota.id}>
                {mascota.nombre} ({mascota.especie})
              </option>
            ))}
          </select>

          {mostrarError('mascota')}
        </div>

        <div className="mb-3">
          <label htmlFor="vacuna" className="form-label">
            Vacuna
          </label>

          <select
            id="vacuna"
            name="vacuna"
            className={`form-select ${errores.vacuna ? 'is-invalid' : ''}`}
            value={datos.vacuna}
            onChange={cambiar}
            required
          >
            <option value="">Seleccione una vacuna</option>
            {vacunas.map((vacuna) => (
              <option key={vacuna.id} value={vacuna.id}>
                {vacuna.nombre}
              </option>
            ))}
          </select>

          {mostrarError('vacuna')}
        </div>

        <div className="mb-3">
          <label htmlFor="fecha_aplicacion" className="form-label">
            Fecha de aplicación
          </label>

          <input
            id="fecha_aplicacion"
            name="fecha_aplicacion"
            type="date"
            max={fechaHoy}
            className={`form-control ${errores.fecha_aplicacion ? 'is-invalid' : ''}`}
            value={datos.fecha_aplicacion}
            onChange={cambiar}
            required
          />

          {mostrarError('fecha_aplicacion')}
        </div>

        <div className="mb-3">
          <label htmlFor="observaciones" className="form-label">
            Observaciones
          </label>

          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
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

          <Link to="/salud/registros" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

export default RegistroForm
