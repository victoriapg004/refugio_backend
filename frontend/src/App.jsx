import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import ListaMascotas from './pages/mascotas/ListaMascotas.jsx'
import MascotaForm from './pages/mascotas/MascotaForm.jsx'
import ListaAdoptantes from './pages/adoptantes/ListaAdoptantes.jsx'
import AdoptanteForm from './pages/adoptantes/AdoptanteForm.jsx'
import ListaSolicitudes from './pages/solicitudes/ListaSolicitudes.jsx'
import SolicitudForm from './pages/solicitudes/SolicitudForm.jsx'
import DetalleSolicitud from './pages/solicitudes/DetalleSolicitud.jsx'
import ListaSalud from './pages/salud/ListaSalud.jsx'
import VacunaForm from './pages/salud/VacunaForm.jsx'
import ListaRegistros from './pages/salud/ListaRegistros.jsx'
import RegistroForm from './pages/salud/RegistroForm.jsx'
import VisitaForm from './pages/visitas/VisitaForm.jsx'
import ListaVisitas from './pages/visitas/ListaVisitas.jsx'



function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mascotas" element={<ListaMascotas />} />
          <Route path="/mascotas/nueva" element={<MascotaForm />} />
          <Route path="/mascotas/:id/editar" element={<MascotaForm />} />
          <Route path="/adoptantes" element={<ListaAdoptantes />} />
          <Route path="/adoptantes/nueva" element={<AdoptanteForm />} />
          <Route path="/adoptantes/:id/editar" element={<AdoptanteForm />} />
          <Route path="/solicitudes" element={<ListaSolicitudes />} />
          <Route path="/solicitudes/nueva" element={<SolicitudForm />} />
          <Route path="/solicitudes/:id" element={<DetalleSolicitud />} />
          <Route path="/salud" element={<ListaSalud />} />
          <Route path="/salud/vacunas/nueva" element={<VacunaForm />} />
          <Route path="/salud/vacunas/:id/editar" element={<VacunaForm />} />
          <Route path="/salud/registros" element={<ListaRegistros />} />
          <Route path="/salud/registros/nuevo" element={<RegistroForm />} />
          <Route path="/salud/registros/:id/editar" element={<RegistroForm />} />
          <Route path="/visitas" element={<ListaVisitas />} />
          <Route path="/visitas/nueva" element={<VisitaForm />} />
          <Route path="/visitas/:id/editar" element={<VisitaForm />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App