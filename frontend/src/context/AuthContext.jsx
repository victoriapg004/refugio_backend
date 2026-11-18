import { createContext, useContext, useState } from 'react'
import cliente from '../api/cliente'

const AuthContext = createContext(null)

function leerPerfil() {
  try {
    return JSON.parse(localStorage.getItem('perfil'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Al recargar la página se restaura la sesión desde localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [perfil, setPerfil] = useState(leerPerfil)

  async function login(usuario, contrasena) {
    const { data } = await cliente.post('/token/', {
      username: usuario,
      password: contrasena,
    })
    // El token se guarda antes de pedir el perfil para que cliente.js lo envíe
    localStorage.setItem('token', data.token)
    try {
      const resp = await cliente.get('/perfil/')
      localStorage.setItem('perfil', JSON.stringify(resp.data))
      setToken(data.token)
      setPerfil(resp.data)
    } catch (error) {
      localStorage.removeItem('token')
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('perfil')
    setToken(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, perfil, login, logout, estaAutenticado: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}