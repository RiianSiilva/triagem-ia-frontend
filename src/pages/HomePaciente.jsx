import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './HomePaciente.css'

function HomePaciente() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (u) {
      const parsed = JSON.parse(u)
      setUsuario(parsed)
      if (parsed.cpf) {
        carregarHistorico(parsed.cpf)
      } else {
        setCarregando(false)
      }
    } else {
      setCarregando(false)
    }
  }, [])

  async function carregarHistorico(cpf) {
    try {
      const { data } = await api.get(`/triagem/historico/${cpf}`)
      setHistorico(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <div className="home-paciente-page">
      <nav className="home-navbar">
        <div className="home-logo">
          <span>+</span> TriagemIA
        </div>
        <div className="home-nav-user">
          <span>Olá, <strong>{usuario?.nome?.split(' ')[0]}</strong></span>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </nav>

      <main className="home-conteudo">
        <div className="banner-boas-vindas">
          <div>
            <h1>Atendimento & Triagem Inteligente</h1>
            <p>Economize tempo na recepção e realize sua pré-triagem no totem digital.</p>
          </div>
          <button className="btn-iniciar-triagem" onClick={() => navigate('/totem')}>
            🚀 Iniciar Nova Triagem no Totem
          </button>
        </div>

        <section className="secao-historico">
          <h2>Seu Histórico de Atendimentos</h2>
          {carregando ? (
            <p className="texto-aviso">Buscando seu histórico...</p>
          ) : historico.length === 0 ? (
            <div className="card-sem-historico">
              <p>Você ainda não realizou nenhuma triagem recente.</p>
              <button className="btn-link" onClick={() => navigate('/totem')}>Fazer minha primeira triagem agora</button>
            </div>
          ) : (
            <div className="grade-historico-cards">
              {historico.map(h => (
                <div key={h.id} className={`card-historico-item borda-${h.cor?.toLowerCase()}`}>
                  <div className="historico-top">
                    <span className={`tag-cor-manchester bg-${h.cor?.toLowerCase()}`}>{h.cor}</span>
                    <small>{new Date(h.dataTriagem).toLocaleDateString('pt-BR')} às {new Date(h.dataTriagem).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                  <h4>{h.sintomas}</h4>
                  <p><strong>Orientação:</strong> {h.condutaRecomendada}</p>
                  <span className="status-badge-paciente">Status: {h.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePaciente
