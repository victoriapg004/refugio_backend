import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function RutaProtegida() {
    const { estaAutenticado } = useAuth()
    return estaAutenticado ? <Outlet /> : <Navigate to="/login" replace />
}

export default RutaProtegida