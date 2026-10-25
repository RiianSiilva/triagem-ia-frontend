import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e) {
    if (e) e.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const { data } = await api.post('/auth/login', { email, senha })
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        cpf: data.cpf
      }))

      if (data.perfil === 'PACIENTE') {
        navigate('/totem')
      } else {
        navigate('/painel')
      }
    } catch (err) {
      console.error(err)
      setErro('E-mail ou senha inválidos. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  // Atalho para demonstração rápida na feira de ciências!
  function preencherAtalho(perfilEmail, perfilSenha) {
    setEmail(perfilEmail)
    setSenha(perfilSenha)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-circulo">+</div>
          <h1>TriagemIA</h1>
          <p>Sistema de Otimização da Triagem Hospitalar • Protocolo de Manchester</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {erro && <div className="login-erro">{erro}</div>}

          <div className="login-campo">
            <label>E-mail institucional ou do paciente</label>
            <input
              type="email"
              placeholder="seu.email@hospital.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-campo">
            <label>Senha de acesso</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? 'Entrando no sistema...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* DEMONSTRAÇÃO FEIRA DE CIÊNCIAS */}
        <div className="atalhos-feira">
          <span className="atalhos-titulo">⚡ Perfis para Demonstração:</span>
          <div className="atalhos-botoes">
            <button
              type="button"
              className="btn-atalho"
              onClick={() => preencherAtalho('medico@hospital.com', '123')}
            >
              🩺 Médico
            </button>
            <button
              type="button"
              className="btn-atalho"
              onClick={() => preencherAtalho('enfermeira@hospital.com', '123')}
            >
              👩‍⚕️ Enfermeira
            </button>
            <button
              type="button"
              className="btn-atalho"
              onClick={() => preencherAtalho('paciente@hospital.com', '123')}
            >
              👤 Paciente (Totem)
            </button>
            <button
              type="button"
              className="btn-atalho"
              onClick={() => preencherAtalho('admin@hospital.com', '123')}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
