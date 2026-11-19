import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listarMascotas, eliminarMascota } from '../../api/mascotas'
import { mensajeError } from '../../utils/errores.js'
import usePermisos from '../../hooks/usePermisos.js'
import Alerta from '../../components/Alerta.jsx'
import Cargando from '../../components/Cargando.jsx'
import EstadoVacio from '../../components/EstadoVacio.jsx'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'
import Paginacion from '../../components/Paginacion.jsx'

const ESTADOS = {
  disponible: 'Disponible',
  en_proceso: 'En proceso',
  adoptada: 'Adoptada',
}

function ListaMascotas() {
  const { puedeCrear, puedeEditar, puedeBorrar } = usePermisos()
  const location = useLocation()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(location.state?.exito || '')
  const [recarga, setRecarga] = useState(0)

  // Filtros que se mandan al backend
  const [especie, setEspecie] = useState('')
  const [estado, setEstado] = useState('')
  const [orden, setOrden] = useState('nombre')
  const [buscar, setBuscar] = useState('')
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const [aEliminar, setAEliminar] = useState(null)

  useEffect(() => {
    const params = { orden, pagina }
    if (especie) params.especie = especie
    if (estado) params.estado = estado
    if (buscar) params.buscar = buscar

    let cancelado = false
    listarMascotas(params)
      .then((resp) => {
        if (cancelado) return
        setDatos(resp.data)
        setError('')
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err))
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [especie, estado, orden, buscar, pagina, recarga])

  // Cada cambio de filtro vuelve a la página 1
  function cambiarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
    setCargando(true)
  }

  function enviarBusqueda(e) {
    e.preventDefault()
    cambiarFiltro(setBuscar, textoBusqueda.trim())
  }

  function cambiarPagina(nueva) {
    setPagina(nueva)
    setCargando(true)
  }

  async function confirmarEliminar() {
    const mascota = aEliminar
    setAEliminar(null)
    setExito('')
    try {
      await eliminarMascota(mascota.id)
      setError('')
      setExito(`Se eliminó a ${mascota.nombre}.`)
      setCargando(true)
      setRecarga((n) => n + 1)
    } catch (err) {
      // Un 409 significa que la mascota tiene solicitudes o vacunas registradas
      setError(mensajeError(err))
    }
  }

  const lista = datos?.resultados || []

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Mascotas</h2>
        {puedeCrear && (
          <Link to="/mascotas/nueva" className="btn btn-primary">
            Nueva mascota
          </Link>
        )}
      </div>

      <Alerta mensaje={error} onCerrar={() => setError('')} />
      <Alerta tipo="success" mensaje={exito} onCerrar={() => setExito('')} />

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <form className="input-group" onSubmit={enviarBusqueda}>
            <input
              className="form-control"
              placeholder="Buscar por nombre o raza"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
            <button className="btn btn-outline-secondary" type="submit">
              Buscar
            </button>
          </form>
        </div>
        <div className="col-6 col-md-2">
          <select
            className="form-select"
            value={especie}
            onChange={(e) => cambiarFiltro(setEspecie, e.target.value)}
          >
            <option value="">Todas las especies</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={estado}
            onChange={(e) => cambiarFiltro(setEstado, e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_proceso">En proceso</option>
            <option value="adoptada">Adoptada</option>
          </select>
        </div>
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={orden}
            onChange={(e) => cambiarFiltro(setOrden, e.target.value)}
          >
            <option value="nombre">Nombre (A-Z)</option>
            <option value="-nombre">Nombre (Z-A)</option>
            <option value="edad">Edad (menor a mayor)</option>
            <option value="-edad">Edad (mayor a menor)</option>
            <option value="-fecha_ingreso">Ingreso (más reciente)</option>
            <option value="fecha_ingreso">Ingreso (más antiguo)</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <Cargando />
      ) : lista.length === 0 ? (
        <EstadoVacio mensaje="No hay mascotas que coincidan con la búsqueda." />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especie</th>
                  <th>Raza</th>
                  <th>Edad (meses)</th>
                  <th>Estado</th>
                  <th>Ingreso</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td className="text-capitalize">{m.especie}</td>
                    <td>{m.raza || '-'}</td>
                    <td>{m.edad}</td>
                    <td>{ESTADOS[m.estado] || m.estado}</td>
                    <td>{m.fecha_ingreso}</td>
                    <td className="text-end">
                      {puedeEditar && (
                        <Link
                          to={`/mascotas/${m.id}/editar`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          Editar
                        </Link>
                      )}
                      {puedeBorrar && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setAEliminar(m)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{datos.total_registros} registro(s)</small>
            <Paginacion
              paginaActual={datos.pagina_actual}
              totalPaginas={datos.total_paginas}
              onCambiar={cambiarPagina}
            />
          </div>
        </>
      )}

      <ModalConfirmar
        visible={!!aEliminar}
        mensaje={`¿Seguro que desea eliminar a ${aEliminar?.nombre}? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}

export default ListaMascotas