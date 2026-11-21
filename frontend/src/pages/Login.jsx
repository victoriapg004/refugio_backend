import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { mensajeError } from '../utils/errores.js'
import Alerta from '../components/Alerta.jsx'
import Logo from '../components/Logo.jsx'

function Login() {
  const { login, estaAutenticado } = useAuth()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  
  // Mensaje que deja cliente.js cuando la API respondió 401 en otra pantalla
  const [aviso, setAviso] = useState(() => {
    const texto = sessionStorage.getItem('aviso_sesion') || ''
    sessionStorage.removeItem('aviso_sesion')
    return texto
  })
  const [enviando, setEnviando] = useState(false)

  if (estaAutenticado) return <Navigate to="/" replace />

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setAviso('')
    setEnviando(true)
    try {
      await login(usuario, contrasena)
      navigate('/', { replace: true })
    } catch (err) {
     
      setError(
        err.response?.status === 400
          ? 'Usuario o contraseña incorrectos'
          : mensajeError(err)
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <div className="text-center mb-2"><Logo tamano={84} /></div>
      <h2 className="mb-4 text-center">Iniciar sesión</h2>
      <Alerta mensaje={aviso} tipo="warning" onCerrar={() => setAviso('')} />
      <Alerta mensaje={error} onCerrar={() => setError('')} />
      <form onSubmit={enviar}>
        <div className="mb-3">
          <label htmlFor="usuario" className="form-label">Usuario</label>
          <input
            id="usuario"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contrasena" className="form-label">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            className="form-control"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default Login