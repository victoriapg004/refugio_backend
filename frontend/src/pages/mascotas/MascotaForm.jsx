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

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setErrores({})
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

      {/* noValidate: así el 400 lo devuelve el backend y se muestra en el campo */}
      <form onSubmit={enviar} noValidate>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input id="nombre" name="nombre" className={clase('nombre')}
            value={datos.nombre} onChange={cambiar} />
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
              value={datos.raza} onChange={cambiar} />
            {textoError('raza')}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="edad" className="form-label">Edad (en meses)</label>
            <input id="edad" name="edad" type="number" className={clase('edad')}
              value={datos.edad} onChange={cambiar} />
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

        <button type="submit" className="btn btn-primary me-2" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </button>
        <Link to="/mascotas" className="btn btn-outline-secondary">Cancelar</Link>
      </form>
    </div>
  )
}

export default MascotaForm