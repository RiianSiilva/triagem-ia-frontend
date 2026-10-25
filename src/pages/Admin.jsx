import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Admin.css'

function Admin() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarPacientes() {
      try {
        const { data } = await api.get('/triagem/pacientes')
        setPacientes(data)
      } catch (e) {
        console.error(e)
      } finally {
        setCarregando(false)
      }
    }
    carregarPacientes()
  }, [])

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <h2>🛡️ Painel Administrativo do Hospital</h2>
        <div className="admin-nav-botoes">
          <button className="btn-admin-link" onClick={() => navigate('/painel')}>Ir para Triagem</button>
          <button className="btn-admin-link" onClick={() => navigate('/relatorio')}>Ver Relatórios</button>
        </div>
      </nav>

      <main className="admin-conteudo">
        <div className="admin-header-card">
          <h1>Cadastro de Pacientes & Registros</h1>
          <p>Gerenciamento da base de usuários cadastrados no sistema hospitalar.</p>
        </div>

        {carregando ? (
          <p className="admin-msg">Carregando pacientes cadastrados...</p>
        ) : (
          <div className="admin-tabela-box">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome Completo</th>
                  <th>CPF</th>
                  <th>Data Nascimento</th>
                  <th>Telefone</th>
                  <th>Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.cpf}</td>
                    <td>{p.dataNascimento || '--'}</td>
                    <td>{p.telefoneContato || '--'}</td>
                    <td>{p.dataCadastro ? new Date(p.dataCadastro).toLocaleDateString('pt-BR') : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
