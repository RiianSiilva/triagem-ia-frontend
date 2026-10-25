import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import HomePaciente from './pages/HomePaciente'
import Totem from './pages/totem'
import PainelMedico from './pages/painelMedico'
import Admin from './pages/Admin'
import Relatorio from './pages/Relatorio'
import PerfilPaciente from './pages/PerfilPaciente'
import RotaProtegida from './components/RotaProtegida'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Login e Boas-Vindas */}
      <Route path="/" element={<Login />} />

      {/* Totem de Autoatendimento do Paciente (com Mapa Corporal) */}
      <Route path="/totem" element={<Totem />} />

      {/* Área do Paciente */}
      <Route path="/home" element={
        <RotaProtegida perfisPermitidos={['PACIENTE', 'ADMIN']}>
          <HomePaciente />
        </RotaProtegida>
      } />

      <Route path="/perfil" element={
        <RotaProtegida perfisPermitidos={['PACIENTE', 'ADMIN']}>
          <PerfilPaciente />
        </RotaProtegida>
      } />

      {/* Painel da Equipe Médica & Enfermagem (com Revisão Manchester e Alertas ACK) */}
      <Route path="/painel" element={
        <RotaProtegida perfisPermitidos={['MEDICO', 'ENFERMEIRA', 'ADMIN']}>
          <PainelMedico />
        </RotaProtegida>
      } />

      {/* Relatórios e Auditoria Hospitalar */}
      <Route path="/relatorio" element={
        <RotaProtegida perfisPermitidos={['MEDICO', 'ENFERMEIRA', 'ADMIN']}>
          <Relatorio />
        </RotaProtegida>
      } />

      {/* Administração e Gerenciamento */}
      <Route path="/admin" element={
        <RotaProtegida perfisPermitidos={['ADMIN']}>
          <Admin />
        </RotaProtegida>
      } />
    </Routes>
  )
}

export default App
