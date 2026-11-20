
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obtenerVacuna, crearVacuna, editarVacuna } from '../../api/salud.js'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'

const VACIO = {
  nombre: '',
  descripcion: '',
}

function VacunaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { puedeCrear, puedeEditar } = usePermisos()
  const permitido = id ? puedeEditar : puedeCrear

  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!id) return

    let activo = true

    obtenerVacuna(id)
      .then((respuesta) => {
        if (activo) {
          setDatos({
            nombre: respuesta.data.nombre ?? '',
            descripcion: respuesta.data.descripcion ?? '',
          })
        }
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
  }, [id])

  function cambiar(e) {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    })

    setErrores({
      ...errores,
      [e.target.name]: undefined,
    })
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setErrores({})

    if (!permitido) {
      setError('No tiene permiso para guardar vacunas.')
      return
    }

    const payload = {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
    }

    if (!payload.nombre) {
      setErrores({ nombre: ['El nombre es obligatorio.'] })
      return
    }

    setGuardando(true)

    try {
      if (id) {
        await editarVacuna(id, payload)
      } else {
        await crearVacuna(payload)
      }

      navigate('/salud', {
        state: {
          exito: id
            ? 'Vacuna actualizada correctamente.'
            : 'Vacuna registrada correctamente.',
        },
      })
    } catch (err) {
      if (err.response?.status === 400) {
        const erroresBackend = err.response.data || {}

        const nombreDuplicado = [].concat(erroresBackend.nombre || [])
          .some((mensaje) => String(mensaje).includes('already exists'))

        if (nombreDuplicado) {
          setErrores({
            ...erroresBackend,
            nombre: ['Ya existe una vacuna registrada con este nombre.'],
          })
          setError('Ya existe una vacuna registrada con este nombre.')
        } else {
          setErrores(erroresBackend)
          setError(mensajeError(err))
        }
      } else {
        setError(mensajeError(err))
      }
    } finally {
      setGuardando(false)
    }

  }

  function mostrarError(campo) {
    if (!errores[campo]) return null

    return (
      <div className="invalid-feedback">
        {[].concat(errores[campo]).join(' ')}
      </div>
    )
  }

  if (cargando) return <Cargando texto="Cargando vacuna..." />

  return (
    <div className="col-12 col-md-8 col-lg-6">
      <h2 className="mb-3">
        {id ? 'Editar vacuna' : 'Nueva vacuna'}
      </h2>

      <Alerta mensaje={error} onCerrar={() => setError('')} />

      <form onSubmit={guardar} noValidate>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre de la vacuna
          </label>

          <input
            id="nombre"
            name="nombre"
            type="text"
            maxLength={100}
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            value={datos.nombre}
            onChange={cambiar}
            required
          />

          {mostrarError('nombre')}
        </div>

        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">
            Descripción
          </label>

          <textarea
            id="descripcion"
            name="descripcion"
            className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
            value={datos.descripcion}
            onChange={cambiar}
            rows={4}
          />

          {mostrarError('descripcion')}
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={guardando || !permitido}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>

          <Link to="/salud" className="btn btn-outline-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

export default VacunaForm
