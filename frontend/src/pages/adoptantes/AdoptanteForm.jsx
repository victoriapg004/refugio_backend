import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obtenerAdoptante, crearAdoptante, editarAdoptante } from '../../api/adoptantes'
import { mensajeError } from '../../utils/errores.js'
import Cargando from '../../components/Cargando.jsx'
import Alerta from '../../components/Alerta.jsx'

const VACIO = { nombre: '', cedula: '', correo: '', telefono: '', direccion: '' }

function AdoptanteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!id) return
    obtenerAdoptante(id)
      .then((respuesta) => {
        const a = respuesta.data
        setDatos({
          nombre: a.nombre ?? '',
          cedula: a.cedula ?? '',
          correo: a.correo ?? '',
          telefono: a.telefono ?? '',
          direccion: a.direccion ?? '',
        })
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [id])

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setErrores({})
    setGuardando(true)
    try {
      if (id) {
        await editarAdoptante(id, datos)
      } else {
        await crearAdoptante(datos)
      }
      navigate('/adoptantes')
    } catch (err) {
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        setErrores(err.response.data)
      }
      setError(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  const textoError = (campo) => [].concat(errores[campo] ?? []).join(' ')

  const campo = (nombre, etiqueta, extra = {}) => (
    <div className="mb-3">
      <label htmlFor={nombre} className="form-label">{etiqueta}</label>
      <input
        id={nombre}
        name={nombre}
        className={`form-control ${errores[nombre] ? 'is-invalid' : ''}`}
        value={datos[nombre]}
        onChange={cambiar}
        {...extra}
      />
      <div className="invalid-feedback">{textoError(nombre)}</div>
    </div>
  )

  return (
    <div className="col-md-8 col-lg-6">
      <h2 className="mb-3">{id ? 'Editar adoptante' : 'Nuevo adoptante'}</h2>

      <Alerta tipo="danger" mensaje={error} onCerrar={() => setError('')} />

      {cargando ? (
        <Cargando texto="Cargando adoptante..." />
      ) : (
        <form onSubmit={enviar}>
          {campo('nombre', 'Nombre', { required: true, maxLength: 50 })}
          {campo('cedula', 'Cédula', { required: true, maxLength: 20 })}
          {campo('correo', 'Correo', { type: 'email', required: true })}
          {campo('telefono', 'Teléfono', { maxLength: 15 })}

          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <textarea
              id="direccion"
              name="direccion"
              rows="3"
              className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
              value={datos.direccion}
              onChange={cambiar}
            />
            <div className="invalid-feedback">{textoError('direccion')}</div>
          </div>

          <button type="submit" className="btn btn-primary me-2" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <Link to="/adoptantes" className="btn btn-outline-secondary">Cancelar</Link>
        </form>
      )}
    </div>
  )
}

export default AdoptanteForm