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

export default cliente