import { useAuth } from '../context/AuthContext.jsx'

function usePermisos() {
    const { perfil } = useAuth()
    return {
        rol: perfil?.rol,
        puedeCrear: !!perfil?.puede_crear,
        puedeEditar: !!perfil?.puede_editar,
        puedeBorrar: !!perfil?.puede_borrar,
    }
}

export default usePermisos