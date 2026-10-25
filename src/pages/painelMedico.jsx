import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAlertas } from '../hooks/useAlertas'
import PainelAlertas from '../components/PainelAlertas'
import './painelMedico.css'

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO: 'cor-amarelo', VERDE: 'cor-verde', AZUL: 'cor-azul'
}

const STATUS_CLASSE = {
  AGUARDANDO: 'status-aguardando',
  EM_ATENDIMENTO: 'status-em-atendimento',
  REVISADO: 'status-revisado',
  ALTA: 'status-alta'
}

const STATUS_LABEL = {
  AGUARDANDO: 'Aguardando',
  EM_ATENDIMENTO: 'Em Atendimento',
  REVISADO: 'Revisado',
  ALTA: 'Alta Concluída'
}

function PainelMedico() {
  const navigate = useNavigate()
  const [triagens, setTriagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('URGENTES')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [usuario, setUsuario] = useState(null)
  const { alertas, removerAlerta } = useAlertas()

  // Modal de Revisão
  const [triagemParaRevisar, setTriagemParaRevisar] = useState(null)
  const [novaCor, setNovaCor] = useState('')
  const [motivoRevisao, setMotivoRevisao] = useState('')
  const [nomeProfissional, setNomeProfissional] = useState('')
  const [salvandoRevisao, setSalvandoRevisao] = useState(false)

  useEffect(() => {
    const dados = localStorage.getItem('usuario')
    if (dados) {
      const u = JSON.parse(dados)
      setUsuario(u)
      setNomeProfissional(u.nome || '')
    }
    carregarTriagens()
    const interval = setInterval(carregarTriagens, 15000)
    return () => clearInterval(interval)
  }, [filtro])

  async function carregarTriagens() {
    setCarregando(true)
    try {
      let url = '/triagem/urgentes'
      if (filtro === 'TODAS') url = '/triagem/todas'
      else if (filtro !== 'URGENTES') url = `/triagem/cor/${filtro}`
      const { data } = await api.get(url)
      setTriagens(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.put(`/triagem/${id}/status?status=${status}`)
      carregarTriagens()
    } catch (e) {
      console.error(e)
    }
  }

  function abrirModalRevisao(triagem) {
    setTriagemParaRevisar(triagem)
    setNovaCor(triagem.cor)
    setMotivoRevisao(triagem.motivoAlteracaoCor || '')
  }

  async function salvarRevisao(e) {
    e.preventDefault()
    if (!novaCor) {
      alert('Selecione a classificação final.')
      return
    }
    if (novaCor !== triagemParaRevisar.cor && !motivoRevisao.trim()) {
      alert('Informe a justificativa clínica para alterar a classificação da IA.')
      return
    }

    try {
      setSalvandoRevisao(true)
      await api.put(`/triagem/${triagemParaRevisar.id}/revisao`, {
        corFinalProfissional: novaCor,
        motivoAlteracaoCor: motivoRevisao.trim() || 'Classificação confirmada pela equipe.',
        nomeProfissional: nomeProfissional.trim() || usuario?.nome || 'Profissional de Saúde'
      })

      setTriagemParaRevisar(null)
      carregarTriagens()
    } catch (error) {
      console.error('Erro ao salvar revisão:', error)
      alert('Não foi possível salvar a revisão médica.')
    } finally {
      setSalvandoRevisao(false)
    }
  }

  function sair() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  const triagensFiltradas = triagens.filter(t =>
    filtroStatus === 'TODOS' || t.status === filtroStatus
  )

  const contadores = {
    AGUARDANDO: triagens.filter(t => t.status === 'AGUARDANDO').length,
    EM_ATENDIMENTO: triagens.filter(t => t.status === 'EM_ATENDIMENTO' || t.status === 'REVISADO').length,
    ALTA: triagens.filter(t => t.status === 'ALTA').length,
  }

  return (
    <div className="painel-page">
      <PainelAlertas alertas={alertas} removerAlerta={removerAlerta} />

      {/* Navbar Superior */}
      <nav className="painel-navbar">
        <div className="painel-navbar-brand">
          <span className="navbar-badge-cross">+</span>
          <div>
            <h2>Posto de Enfermagem & Triagem Médica</h2>
            <small>Classificação de Risco Manchester em Tempo Real</small>
          </div>
        </div>

        <div className="painel-navbar-acoes">
          <div className="usuario-chip">
            <span className="usuario-avatar">{usuario?.nome?.charAt(0).toUpperCase()}</span>
            <div className="usuario-textos">
              <strong>{usuario?.nome?.split(' ')[0]}</strong>
              <small>{usuario?.perfil}</small>
            </div>
          </div>

          <button className="btn-nav btn-nav-secundario" onClick={() => navigate('/relatorio')}>
            📊 Relatórios
          </button>
          <button className="btn-nav btn-nav-secundario" onClick={carregarTriagens}>
            🔄 Atualizar
          </button>
          <button className="btn-nav btn-nav-sair" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>

      <main className="painel-conteudo">
        {/* Contadores do Painel */}
        <section className="grade-contadores">
          <div className="card-contador aguardando">
            <span className="contador-valor">{contadores.AGUARDANDO}</span>
            <span className="contador-titulo">Aguardando Avaliação</span>
          </div>
          <div className="card-contador em-atendimento">
            <span className="contador-valor">{contadores.EM_ATENDIMENTO}</span>
            <span className="contador-titulo">Em Atendimento / Revisado</span>
          </div>
          <div className="card-contador alta">
            <span className="contador-valor">{contadores.ALTA}</span>
            <span className="contador-titulo">Altas Concluídas</span>
          </div>
          <div className="card-contador total">
            <span className="contador-valor">{triagens.length}</span>
            <span className="contador-titulo">Total de Triagens Hoje</span>
          </div>
        </section>

        {/* Filtros de Cor e Status */}
        <section className="barra-filtros">
          <div className="filtro-bloco">
            <span className="filtro-titulo">Classificação Manchester:</span>
            <div className="filtro-tags">
              {['URGENTES', 'TODAS', 'VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(f => (
                <button
                  key={f}
                  className={`btn-tag-filtro ${filtro === f ? 'ativo' : ''} ${COR_CLASSE[f] || ''}`}
                  onClick={() => setFiltro(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="filtro-bloco">
            <span className="filtro-titulo">Status de Atendimento:</span>
            <div className="filtro-tags">
              {['TODOS', 'AGUARDANDO', 'EM_ATENDIMENTO', 'ALTA'].map(s => (
                <button
                  key={s}
                  className={`btn-tag-filtro ${filtroStatus === s ? 'ativo' : ''}`}
                  onClick={() => setFiltroStatus(s)}
                >
                  {s === 'TODOS' ? 'Todos' : STATUS_LABEL[s]}
                  {s !== 'TODOS' && <span className="chip-numero">{contadores[s] || 0}</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Fila de Pacientes */}
        {carregando ? (
          <div className="estado-vazio">Buscando triagens hospitalares...</div>
        ) : triagensFiltradas.length === 0 ? (
          <div className="estado-vazio">Nenhum paciente encontrado com os filtros selecionados.</div>
        ) : (
          <div className="grade-triagens">
            {triagensFiltradas.map(t => (
              <div key={t.id} className={`cartao-paciente-triagem ${COR_CLASSE[t.cor]} ${t.status === 'ALTA' ? 'cartao-finalizado' : ''}`}>
                <div className="cartao-header-manchester">
                  <div className="manchester-cor-nome">
                    <span className="cor-circulo-badge" />
                    <strong>{t.cor}</strong>
                    <span className="prioridade-texto">• {t.prioridade}</span>
                  </div>
                  <span className="cartao-tempo-alvo">
                    ⏱️ {t.tempoEspera === 0 ? 'IMEDIATO' : `${t.tempoEspera} min`}
                  </span>
                </div>

                <div className="cartao-corpo">
                  <div className="paciente-cabecalho-linha">
                    <h3>{t.paciente?.nome}</h3>
                    <span className="paciente-idade">{t.paciente?.idade || t.idade || '--'} anos</span>
                  </div>

                  {t.queixaPrincipal && (
                    <p className="dado-queixa">
                      <strong>Queixa:</strong> {t.queixaPrincipal}
                    </p>
                  )}

                  <p className="dado-linha">
                    <strong>Local da Dor:</strong> {t.localDor || 'Geral'}
                  </p>

                  <p className="dado-linha">
                    <strong>Sintomas:</strong> {t.sintomas}
                  </p>

                  <p className="dado-conduta">
                    <strong>Conduta Sugerida:</strong> {t.condutaRecomendada}
                  </p>

                  {/* Sinais Vitais em Chips Clean */}
                  <div className="grade-sinais-chips">
                    {t.pressaoSistolica && <span className="sinal-chip">💓 PA: {t.pressaoSistolica}/{t.pressaoDiastolica}</span>}
                    {t.temperatura && <span className="sinal-chip">🌡️ {t.temperatura}°C</span>}
                    {t.saturacaoO2 && <span className="sinal-chip">🫁 SpO2: {t.saturacaoO2}%</span>}
                    {t.frequenciaCardiaca && <span className="sinal-chip">❤️ FC: {t.frequenciaCardiaca} bpm</span>}
                    {t.frequenciaRespiratoria && <span className="sinal-chip">💨 FR: {t.frequenciaRespiratoria} irpm</span>}
                    {t.glicemia && <span className="sinal-chip">🩸 Glicemia: {t.glicemia} mg/dL</span>}
                    {t.imc && <span className="sinal-chip">⚖️ IMC: {t.imc}</span>}
                  </div>

                  {/* Auditoria Médica */}
                  {t.motivoAlteracaoCor && (
                    <div className="alerta-auditoria-medica">
                      👨‍⚕️ <strong>Auditoria Médica:</strong> {t.motivoAlteracaoCor}
                      <small>Responsável: {t.nomeProfissional}</small>
                    </div>
                  )}

                  <div className="cartao-rodape-acoes">
                    <span className={`badge-status-atual ${STATUS_CLASSE[t.status] || 'status-aguardando'}`}>
                      {STATUS_LABEL[t.status] || 'Aguardando'}
                    </span>

                    <div className="botoes-acao-medica">
                      {/* Botão de Revisão da Decisão da IA */}
                      <button
                        className="btn-acao-quadrado btn-revisar"
                        title="Revisar e alterar classificação do Manchester"
                        onClick={() => abrirModalRevisao(t)}
                      >
                        ✏️ Revisar
                      </button>

                      {(!t.status || t.status === 'AGUARDANDO' || t.status === 'REVISADO') && (
                        <button
                          className="btn-acao-quadrado btn-atender"
                          onClick={() => atualizarStatus(t.id, 'EM_ATENDIMENTO')}
                        >
                          Atender
                        </button>
                      )}

                      {t.status === 'EM_ATENDIMENTO' && (
                        <button
                          className="btn-acao-quadrado btn-alta"
                          onClick={() => atualizarStatus(t.id, 'ALTA')}
                        >
                          Dar Alta
                        </button>
                      )}

                      {t.status === 'ALTA' && (
                        <span className="texto-alta-ok">✓ Atendido</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE REVISÃO HUMANA (AUDITORIA DO PROTOCOLO DE MANCHESTER) */}
      {triagemParaRevisar && (
        <div className="modal-backdrop" onClick={() => setTriagemParaRevisar(null)}>
          <div className="modal-janela" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>🩺 Revisão da Triagem • Protocolo de Manchester</h2>
              <button className="btn-modal-fechar" onClick={() => setTriagemParaRevisar(null)}>✕</button>
            </div>

            <form onSubmit={salvarRevisao} className="modal-formulario">
              <div className="modal-info-paciente">
                <p><strong>Paciente:</strong> {triagemParaRevisar.paciente?.nome}</p>
                <p>
                  <strong>Classificação sugerida pela IA:</strong>{' '}
                  <span className={`tag-cor-atual ${COR_CLASSE[triagemParaRevisar.cor]}`}>
                    {triagemParaRevisar.cor}
                  </span>
                </p>
              </div>

              <label className="label-revisao">Definir Nova Classificação de Risco:</label>
              <div className="grade-escolha-cores">
                {['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL'].map(cor => (
                  <button
                    key={cor}
                    type="button"
                    className={`btn-cor-escolha ${COR_CLASSE[cor]} ${novaCor === cor ? 'selecionada' : ''}`}
                    onClick={() => setNovaCor(cor)}
                  >
                    {cor}
                  </button>
                ))}
              </div>

              <label className="label-revisao">Justificativa Clínica da Decisão: *</label>
              <textarea
                rows="3"
                required={novaCor !== triagemParaRevisar.cor}
                placeholder="Ex: Paciente apresentou hipotensão súbita e sudorese fria na reavaliação presencial..."
                value={motivoRevisao}
                onChange={e => setMotivoRevisao(e.target.value)}
              />

              <label className="label-revisao">Profissional Responsável (Nome / COREN / CRM): *</label>
              <input
                type="text"
                required
                placeholder="Ex: Enf. Mariana Costa - COREN 45892"
                value={nomeProfissional}
                onChange={e => setNomeProfissional(e.target.value)}
              />

              <div className="modal-rodape-botoes">
                <button type="button" className="btn-modal-cancelar" onClick={() => setTriagemParaRevisar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-confirmar" disabled={salvandoRevisao}>
                  {salvandoRevisao ? 'Gravando no Prontuário...' : 'Confirmar e Salvar Decisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PainelMedico
