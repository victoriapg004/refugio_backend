import { NavLink, Outlet } from 'react-router-dom'

const enlaces = [
  { ruta: '/', texto: 'Dashboard' },
  { ruta: '/mascotas', texto: 'Mascotas' },
  { ruta: '/adoptantes', texto: 'Adoptantes' },
  { ruta: '/solicitudes', texto: 'Solicitudes' },
  { ruta: '/visitas', texto: 'Visitas' },
  { ruta: '/salud', texto: 'Salud' },
]

function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Refugio de Mascotas</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menuPrincipal"
            aria-controls="menuPrincipal"
            aria-expanded="false"
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="menuPrincipal">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {enlaces.map((e) => (
                <li className="nav-item" key={e.ruta}>
                  <NavLink
                    to={e.ruta}
                    end={e.ruta === '/'}
                    className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                  >
                    {e.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}

export default Layout