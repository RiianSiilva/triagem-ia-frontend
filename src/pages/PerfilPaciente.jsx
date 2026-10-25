import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './PerfilPaciente.css'

function PerfilPaciente() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (u) setUsuario(JSON.parse(u))
  }, [])

  return (
    <div className="perfil-page">
      <nav className="perfil-nav">
        <button className="btn-voltar-perfil" onClick={() => navigate('/home')}>
          ← Voltar
        </button>
        <h2>Meu Perfil de Saúde</h2>
      </nav>

      <main className="perfil-card">
        <div className="perfil-avatar-circulo">
          {usuario?.nome?.charAt(0).toUpperCase() || 'P'}
        </div>
        <h3>{usuario?.nome}</h3>
        <p className="perfil-sub">{usuario?.email}</p>

        <div className="perfil-dados-box">
          <div className="perfil-item">
            <span>CPF:</span>
            <strong>{usuario?.cpf || 'Não informado'}</strong>
          </div>
          <div className="perfil-item">
            <span>Perfil de Acesso:</span>
            <strong>{usuario?.perfil}</strong>
          </div>
        </div>

        <button className="btn-ir-totem" onClick={() => navigate('/totem')}>
          Iniciar Nova Triagem Hospitalar
        </button>
      </main>
    </div>
  )
}

export default PerfilPaciente
