import axios from 'axios'

const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

cliente.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url = error.config?.url || ''
    // Un 401 fuera del login significa sesión vencida o token inválido
    if (error.response?.status === 401 && !url.includes('/token/')) {
      localStorage.removeItem('token')
      localStorage.removeItem('perfil')
      // Se avisa en el login por qué se cerró la sesión (401 visible y controlado)
      sessionStorage.setItem('aviso_sesion', 'Su sesión no es válida o expiró. Inicie sesión de nuevo.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default cliente