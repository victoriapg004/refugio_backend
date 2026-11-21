import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obtenerMascota, crearMascota, editarMascota } from '../../api/mascotas'
import { mensajeError } from '../../utils/errores.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'

const VACIO = {
  nombre: '',
  especie: 'perro',
  raza: '',
  edad: '',
  descripcion: '',
  estado: 'disponible',
}

function MascotaForm() {
  const { id } = useParams()
  const editando = !!id
  const navigate = useNavigate()

  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(editando)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState({})

  // Al editar, se precargan los valores actuales de la mascota
  useEffect(() => {
    if (!editando) return
    obtenerMascota(id)
      .then((resp) => setDatos({ ...VACIO, ...resp.data }))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }, [id, editando])

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  // Validación previa en el navegador. Complementa, pero no sustituye,
  // las validaciones del backend (por ejemplo la regla R9 de la edad).
  function validar() {
    const nuevos = {}
    const nombre = datos.nombre.trim()
    if (!nombre) nuevos.nombre = 'El nombre es obligatorio.'
    else if (nombre.length > 100) nuevos.nombre = 'El nombre no puede superar 100 caracteres.'

    if (datos.raza.trim().length > 100) nuevos.raza = 'La raza no puede superar 100 caracteres.'

    if (String(datos.edad).trim() === '') {
      nuevos.edad = 'La edad es obligatoria.'
    } else {
      const edad = Number(datos.edad)
      if (!Number.isInteger(edad)) nuevos.edad = 'La edad debe ser un número entero de meses.'
      else if (edad <= 0) nuevos.edad = 'La edad debe ser mayor que 0 meses.'
      else if (edad > 360) nuevos.edad = 'La edad no puede superar los 360 meses (30 años).'
    }
    return nuevos
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setErrores({})

    const erroresPrevios = validar()
    if (Object.keys(erroresPrevios).length > 0) {
      setErrores(erroresPrevios)
      setError('Revise los campos marcados.')
      return
    }

    setEnviando(true)

    const payload = {
      nombre: datos.nombre.trim(),
      especie: datos.especie,
      raza: datos.raza.trim(),
      edad: Number(datos.edad),
      descripcion: datos.descripcion,
      estado: datos.estado,
    }

    try {
      if (editando) {
        await editarMascota(id, payload)
      } else {
        await crearMascota(payload)
      }
      navigate('/mascotas', {
        state: {
          exito: editando
            ? 'Mascota actualizada correctamente.'
            : 'Mascota registrada correctamente.',
        },
      })
    } catch (err) {
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        // Errores por campo (por ejemplo, la regla de la edad)
        setErrores(err.response.data)
        setError('Revise los campos marcados.')
      } else {
        setError(mensajeError(err))
      }
    } finally {
      setEnviando(false)
    }
  }

  function clase(campo) {
    return `form-control ${errores[campo] ? 'is-invalid' : ''}`
  }

  function textoError(campo) {
    return errores[campo] ? (
      <div className="invalid-feedback">{[].concat(errores[campo]).join(' ')}</div>
    ) : null
  }

  if (cargando) return <Cargando />

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="mb-3">{editando ? 'Editar mascota' : 'Nueva mascota'}</h2>
      <Alerta mensaje={error} onCerrar={() => setError('')} />

      {/* noValidate: la validación previa la hace validar() con mensajes propios;
          los errores 400 del backend también se muestran debajo de cada campo */}
      <form onSubmit={enviar} noValidate>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre *</label>
          <input id="nombre" name="nombre" className={clase('nombre')}
            value={datos.nombre} onChange={cambiar} required maxLength={100} />
          {textoError('nombre')}
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="especie" className="form-label">Especie</label>
            <select id="especie" name="especie" className="form-select"
              value={datos.especie} onChange={cambiar}>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
            </select>
            {textoError('especie')}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select id="estado" name="estado" className="form-select"
              value={datos.estado} onChange={cambiar}>
              <option value="disponible">Disponible</option>
              <option value="en_proceso">En proceso</option>
              <option value="adoptada">Adoptada</option>
            </select>
            {textoError('estado')}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="raza" className="form-label">Raza</label>
            <input id="raza" name="raza" className={clase('raza')}
              value={datos.raza} onChange={cambiar} maxLength={100} />
            {textoError('raza')}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="edad" className="form-label">Edad (en meses) *</label>
            <input id="edad" name="edad" type="number" className={clase('edad')}
              value={datos.edad} onChange={cambiar} required min={1} max={360} step={1} />
            {textoError('edad')}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" rows="3"
            className={clase('descripcion')} value={datos.descripcion}
            onChange={cambiar} />
          {textoError('descripcion')}
        </div>

        <p className="text-muted small">* Campo obligatorio</p>

        <button type="submit" className="btn btn-primary me-2" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/mascotas" className="btn btn-outline-secondary">Cancelar</Link>
      </form>
    </div>
  )
}

export default MascotaForm