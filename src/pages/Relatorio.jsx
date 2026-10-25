import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Relatorio.css'

function Relatorio() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data } = await api.get('/triagem/todas')
        setTriagens(data)
      } catch (e) {
        console.error(e)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  const total = triagens.length
  const contagemCores = {
    VERMELHO: triagens.filter(t => t.cor === 'VERMELHO').length,
    LARANJA:  triagens.filter(t => t.cor === 'LARANJA').length,
    AMARELO:  triagens.filter(t => t.cor === 'AMARELO').length,
    VERDE:    triagens.filter(t => t.cor === 'VERDE').length,
    AZUL:     triagens.filter(t => t.cor === 'AZUL').length,
  }

  const revisadas = triagens.filter(t => t.motivoAlteracaoCor || t.status === 'REVISADO').length
  const emContingencia = triagens.filter(t => t.modoContingencia).length

  return (
    <div className="relatorio-page">
      <nav className="relatorio-navbar">
        <div className="relatorio-brand">
          <span className="brand-badge">+</span>
          <h2>Relatórios & Auditoria Clínica</h2>
        </div>
        <button className="btn-voltar" onClick={() => navigate('/painel')}>
          ← Voltar ao Painel
        </button>
      </nav>

      <main className="relatorio-conteudo">
        <div className="relatorio-header-bloco">
          <h1>Métricas do Protocolo de Manchester</h1>
          <p>Dados consolidados para auditoria hospitalar, tempos de espera e intervenção profissional.</p>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grade-metricas-resumo">
          <div className="card-metrica">
            <span className="metrica-numero">{total}</span>
            <span className="metrica-rotulo">Total de Pacientes Triados</span>
          </div>

          <div className="card-metrica">
            <span className="metrica-numero">{contagemCores.VERMELHO + contagemCores.LARANJA}</span>
            <span className="metrica-rotulo">Casos Urgentes (Vermelho / Laranja)</span>
          </div>

          <div className="card-metrica">
            <span className="metrica-numero">{revisadas}</span>
            <span className="metrica-rotulo">Revisões Realizadas por Médicos/Enfermeiros</span>
          </div>

          <div className="card-metrica">
            <span className="metrica-numero">{emContingencia}</span>
            <span className="metrica-rotulo">Triagens em Modo de Contingência (Manual)</span>
          </div>
        </div>

        {/* DISTRIBUIÇÃO GRÁFICA DAS 5 CORES DE MANCHESTER */}
        <section className="secao-distribuicao-cores">
          <h3>Distribuição por Nível de Risco Manchester</h3>
          <div className="barras-distribuicao">
            {[
              { cor: 'VERMELHO', label: 'Emergência (Imediato)', count: contagemCores.VERMELHO, classe: 'cor-vermelho' },
              { cor: 'LARANJA',  label: 'Muito Urgente (10 min)', count: contagemCores.LARANJA,  classe: 'cor-laranja' },
              { cor: 'AMARELO',  label: 'Urgente (60 min)',       count: contagemCores.AMARELO,  classe: 'cor-amarelo' },
              { cor: 'VERDE',    label: 'Pouco Urgente (120 min)',count: contagemCores.VERDE,    classe: 'cor-verde' },
              { cor: 'AZUL',     label: 'Não Urgente (240 min)',  count: contagemCores.AZUL,     classe: 'cor-azul' }
            ].map(item => {
              const porcentagem = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
              return (
                <div key={item.cor} className="linha-barra-item">
                  <div className="barra-rotulo-info">
                    <strong>{item.cor}</strong>
                    <span>{item.label}</span>
                    <span className="barra-qtd">{item.count} pacientes ({porcentagem}%)</span>
                  </div>
                  <div className="barra-fundo">
                    <div
                      className={`barra-preenchimento ${item.classe}`}
                      style={{ width: `${Math.max(porcentagem, 3)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* TABELA DE AUDITORIA COMPLETA */}
        <section className="secao-tabela-auditoria">
          <div className="tabela-topo">
            <h3>Registro e Auditoria das Triagens</h3>
            <button className="btn-imprimir-relatorio" onClick={() => window.print()}>
              🖨️ Imprimir Relatório Oficial
            </button>
          </div>

          {carregando ? (
            <p className="carregando-txt">Carregando dados consolidados...</p>
          ) : (
            <div className="tabela-container">
              <table className="tabela-relatorio">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Paciente</th>
                    <th>Classificação</th>
                    <th>Sinais Vitais</th>
                    <th>Revisão Humana</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {triagens.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.dataTriagem).toLocaleDateString('pt-BR')} {new Date(t.dataTriagem).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <strong>{t.paciente?.nome}</strong>
                        <small className="cpf-sub">{t.paciente?.cpf}</small>
                      </td>
                      <td>
                        <span className={`badge-tabela-cor bg-${t.cor?.toLowerCase()}`}>{t.cor}</span>
                      </td>
                      <td>
                        <small className="sinais-sub">
                          PA: {t.pressaoSistolica}/{t.pressaoDiastolica} • {t.temperatura}°C • SpO2: {t.saturacaoO2}%
                        </small>
                      </td>
                      <td>
                        {t.motivoAlteracaoCor ? (
                          <div className="auditoria-td">
                            <span>✏️ Alterado por {t.nomeProfissional}</span>
                            <small>"{t.motivoAlteracaoCor}"</small>
                          </div>
                        ) : (
                          <span className="auditoria-conforme">✓ IA Validada</span>
                        )}
                      </td>
                      <td>
                        <span className="badge-tabela-status">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Relatorio
