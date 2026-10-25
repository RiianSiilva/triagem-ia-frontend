import { useState, useEffect } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import MapaCorporal from '../components/MapaCorporal'
import './totem.css'

const SINTOMAS_POPULARES = [
  'Dor forte no peito', 'Falta de ar / Dificuldade para respirar', 'Febre alta',
  'Dor de cabeça intensa', 'Tontura / Fraqueza súbita', 'Desmaio / Apagão',
  'Dor aguda na barriga', 'Náusea / Vômito frequente', 'Sangramento visível',
  'Tosse constante', 'Queda ou batida forte', 'Dormência em braço ou perna'
]

const DOENCAS_COMUNS = [
  'Pressão Alta (Hipertensão)', 'Diabetes', 'Doença do Coração',
  'Asma ou Bronquite', 'Já tive AVC / Derrame', 'Problema nos Rins'
]

const COR_CLASSE = {
  VERMELHO: 'cor-vermelho', LARANJA: 'cor-laranja',
  AMARELO: 'cor-amarelo', VERDE: 'cor-verde', AZUL: 'cor-azul'
}

function StepIndicator({ etapa }) {
  const steps = [
    { num: 1, label: 'Identificação' },
    { num: 2, label: 'Onde Dói & Sintomas' },
    { num: 3, label: 'Sinais de Saúde' },
    { num: 4, label: 'Histórico' }
  ]

  return (
    <div className="totem-topbar-steps">
      {steps.map((s, i) => (
        <div key={s.num} className="totem-step-wrapper">
          <div className={`totem-step ${etapa === s.num ? 'ativo' : etapa > s.num ? 'completo' : ''}`}>
            {etapa > s.num ? '✓' : s.num}
          </div>
          <span className="totem-step-nome">{s.label}</span>
          {i < steps.length - 1 && <div className="totem-step-linha" />}
        </div>
      ))}
    </div>
  )
}

function Totem() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState(null)

  const [form, setForm] = useState({
    nomePaciente: '',
    cpf: '',
    dataNascimento: '',
    sexoBiologico: 'MASCULINO',
    telefoneContato: '',
    nomeResponsavel: '',

    queixaPrincipal: '',
    sintomas: [],
    localDor: 'Não especificado',
    nivelDor: 0,
    inicioSintomas: 'HORAS',
    evolucaoSintomas: 'ESTAVEL',
    sintomaPioraEsforco: false,

    temperatura: '',
    pressaoSistolica: '',
    pressaoDiastolica: '',
    saturacaoO2: '',
    frequenciaCardiaca: '',
    frequenciaRespiratoria: '',
    peso: '',
    altura: '',
    glicemia: '',

    doencasPreexistentes: [],
    medicamentosEmUso: '',
    alergias: '',
    gestante: false,
    semanasGestacao: '',
    jaFoiAtendidoHoje: false,
    observacoes: ''
  })

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario')
    if (usuarioSalvo) {
      try {
        const u = JSON.parse(usuarioSalvo)
        setForm(prev => ({
          ...prev,
          nomePaciente: u.nome || prev.nomePaciente,
          cpf: u.cpf || prev.cpf
        }))
      } catch (e) {}
    }
  }, [])

  function toggleSintoma(sintoma) {
    setForm(prev => ({
      ...prev,
      sintomas: prev.sintomas.includes(sintoma)
        ? prev.sintomas.filter(s => s !== sintoma)
        : [...prev.sintomas, sintoma]
    }))
  }

  function toggleDoenca(doenca) {
    setForm(prev => ({
      ...prev,
      doencasPreexistentes: prev.doencasPreexistentes.includes(doenca)
        ? prev.doencasPreexistentes.filter(d => d !== doenca)
        : [...prev.doencasPreexistentes, doenca]
    }))
  }

  function calcularImc() {
    if (!form.peso || !form.altura || form.altura <= 0) return null
    const alturaM = parseFloat(form.altura) / 100
    const imc = parseFloat(form.peso) / (alturaM * alturaM)
    return imc.toFixed(1)
  }

  async function enviarTriagem() {
    setCarregando(true)
    setErro(null)
    try {
      const payload = {
        nomePaciente: form.nomePaciente,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        sexoBiologico: form.sexoBiologico,
        telefoneContato: form.telefoneContato,
        nomeResponsavel: form.nomeResponsavel || null,

        queixaPrincipal: form.queixaPrincipal,
        sintomas: form.sintomas,
        localDor: form.localDor || 'Corpo Geral',
        nivelDor: parseInt(form.nivelDor),
        inicioSintomas: form.inicioSintomas,
        evolucaoSintomas: form.evolucaoSintomas,
        sintomaPioraEsforco: form.sintomaPioraEsforco,

        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        pressaoSistolica: form.pressaoSistolica ? parseInt(form.pressaoSistolica) : null,
        pressaoDiastolica: form.pressaoDiastolica ? parseInt(form.pressaoDiastolica) : null,
        saturacaoO2: form.saturacaoO2 ? parseInt(form.saturacaoO2) : null,
        frequenciaCardiaca: form.frequenciaCardiaca ? parseInt(form.frequenciaCardiaca) : null,
        frequenciaRespiratoria: form.frequenciaRespiratoria ? parseInt(form.frequenciaRespiratoria) : null,
        peso: form.peso ? parseFloat(form.peso) : null,
        altura: form.altura ? parseFloat(form.altura) : null,
        glicemia: form.glicemia || null,

        doencasPreexistentes: form.doencasPreexistentes,
        medicamentosEmUso: form.medicamentosEmUso ? form.medicamentosEmUso.split(',').map(s => s.trim()) : [],
        alergias: form.alergias ? form.alergias.split(',').map(s => s.trim()) : [],
        gestante: form.gestante,
        semanasGestacao: form.gestante && form.semanasGestacao ? parseInt(form.semanasGestacao) : null,
        jaFoiAtendidoHoje: form.jaFoiAtendidoHoje,
        observacoes: form.observacoes || ''
      }

      const { data } = await api.post('/triagem', payload)
      setResultado(data)
      setEtapa(5)
    } catch (e) {
      console.error(e)
      setErro('Não foi possível gerar a classificação. Verifique os dados ou procure a enfermagem.')
    } finally {
      setCarregando(false)
    }
  }

  function reiniciar() {
    setEtapa(1)
    setResultado(null)
    setErro(null)
  }

  const imcAtual = calcularImc()

  return (
    <div className="totem-page">
      {/* Topbar moderna */}
      <header className="totem-topbar">
        <div className="totem-topbar-brand">
          <span className="brand-cross">+</span>
          <div>
            <h2>Triagem Inteligente</h2>
            <small>Protocolo de Manchester • SUS Digital</small>
          </div>
        </div>
        {etapa <= 4 && <StepIndicator etapa={etapa} />}
        <button className="btn-sair-totem" onClick={() => navigate('/home')}>Sair</button>
      </header>

      <main className="totem-container">

        {/* PASSO 1: IDENTIFICAÇÃO */}
        {etapa === 1 && (
          <div className="totem-card">
            <div className="totem-card-header">
              <span className="badge-passo">Passo 1 de 4</span>
              <h1>Quem é o paciente?</h1>
              <p>Por favor, informe os dados da pessoa que receberá o atendimento.</p>
            </div>

            <div className="totem-form">
              <div className="campo">
                <label>Nome Completo do Paciente *</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Ribeiro"
                  value={form.nomePaciente}
                  onChange={e => setForm({ ...form, nomePaciente: e.target.value })}
                  required
                />
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>CPF *</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={e => setForm({ ...form, cpf: e.target.value })}
                    required
                  />
                </div>
                <div className="campo">
                  <label>Data de Nascimento *</label>
                  <input
                    type="date"
                    value={form.dataNascimento}
                    onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>Sexo Biológico *</label>
                  <select
                    value={form.sexoBiologico}
                    onChange={e => setForm({ ...form, sexoBiologico: e.target.value })}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                  </select>
                </div>
                <div className="campo">
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={form.telefoneContato}
                    onChange={e => setForm({ ...form, telefoneContato: e.target.value })}
                  />
                </div>
              </div>

              <div className="campo">
                <label>Nome do Acompanhante ou Responsável (se menor ou idoso)</label>
                <input
                  type="text"
                  placeholder="Nome do acompanhante..."
                  value={form.nomeResponsavel}
                  onChange={e => setForm({ ...form, nomeResponsavel: e.target.value })}
                />
              </div>

              <div className="botoes-linha-direita">
                <button
                  className="btn-primario btn-grande"
                  disabled={!form.nomePaciente || !form.cpf || !form.dataNascimento}
                  onClick={() => setEtapa(2)}
                >
                  Continuar para Queixa e Sintomas →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: ONDE DÓI (MOLDE ANATÔMICO FRENTE & COSTAS + MANCHESTER) */}
        {etapa === 2 && (
          <div className="totem-card totem-card-amplo">
            <div className="totem-card-header">
              <span className="badge-passo">Passo 2 de 4</span>
              <h1>Onde está o desconforto ou dor?</h1>
              <p>Toque na silhueta do corpo humano abaixo para indicar exatamente o local e a cor da dor.</p>
            </div>

            <div className="totem-form">
              <div className="campo">
                <label>Descreva com suas palavras o que trouxe você aqui hoje: *</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Comecei a sentir um aperto forte no peito e falta de ar que irradia para o braço..."
                  value={form.queixaPrincipal}
                  onChange={e => setForm({ ...form, queixaPrincipal: e.target.value })}
                  required
                />
              </div>

              {/* MOLDE CORPORAL FRENTE & COSTAS COM AS CORES DE MANCHESTER */}
              <MapaCorporal
                localSelecionado={form.localDor}
                onSelectLocal={(local) => setForm(prev => ({ ...prev, localDor: local }))}
                nivelDorSelecionado={form.nivelDor}
                onSelectDor={(valor) => setForm(prev => ({ ...prev, nivelDor: valor }))}
              />

              {/* SINTOMAS ASSOCIADOS */}
              <div className="campo">
                <label>Você também está sentindo algum destes sintomas?</label>
                <div className="sintomas-grid">
                  {SINTOMAS_POPULARES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`btn-sintoma-card ${form.sintomas.includes(s) ? 'selecionado' : ''}`}
                      onClick={() => toggleSintoma(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>Esses sintomas começaram quando?</label>
                  <select
                    value={form.inicioSintomas}
                    onChange={e => setForm({ ...form, inicioSintomas: e.target.value })}
                  >
                    <option value="MINUTOS">Agora pouco (minutos atrás)</option>
                    <option value="HORAS">Hoje (algumas horas atrás)</option>
                    <option value="DIAS">De 1 a 3 dias atrás</option>
                    <option value="SEMANAS">Mais de uma semana</option>
                  </select>
                </div>
                <div className="campo">
                  <label>O que está acontecendo com a dor?</label>
                  <select
                    value={form.evolucaoSintomas}
                    onChange={e => setForm({ ...form, evolucaoSintomas: e.target.value })}
                  >
                    <option value="PIOROU">Está aumentando / piorando</option>
                    <option value="ESTAVEL">Está constante (sempre igual)</option>
                    <option value="MELHOROU">Está diminuindo aos poucos</option>
                  </select>
                </div>
              </div>

              <div className="campo-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.sintomaPioraEsforco}
                    onChange={e => setForm({ ...form, sintomaPioraEsforco: e.target.checked })}
                  />
                  A dor ou falta de ar piora ao andar ou fazer esforço físico?
                </label>
              </div>

              <div className="botoes-linha">
                <button className="btn-secundario" onClick={() => setEtapa(1)}>← Voltar</button>
                <button
                  className="btn-primario btn-grande"
                  disabled={!form.queixaPrincipal}
                  onClick={() => setEtapa(3)}
                >
                  Continuar para Sinais de Saúde →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: SINAIS DE SAÚDE (LINGUAGEM TOTALMENTE AMIGÁVEL) */}
        {etapa === 3 && (
          <div className="totem-card">
            <div className="totem-card-header">
              <span className="badge-passo">Passo 3 de 4</span>
              <h1>Medições de Saúde do Totem</h1>
              <p>Insira os valores lidos pelos aparelhos acoplados ao totem ou informados pela enfermagem.</p>
            </div>

            <div className="totem-form">
              {/* Pressão Arterial com explicação amigável */}
              <div className="campo-medicao-destaque">
                <div className="medicao-titulo-com-dica">
                  <label>Pressão Arterial</label>
                  <span className="dica-texto">💡 Exemplo: 12 por 8 ➔ digite 120 e 80</span>
                </div>
                <div className="pressao-inputs">
                  <input
                    type="number"
                    placeholder="Máx (Ex: 120)"
                    value={form.pressaoSistolica}
                    onChange={e => setForm({ ...form, pressaoSistolica: e.target.value })}
                  />
                  <span className="barra-separadora">/</span>
                  <input
                    type="number"
                    placeholder="Mín (Ex: 80)"
                    value={form.pressaoDiastolica}
                    onChange={e => setForm({ ...form, pressaoDiastolica: e.target.value })}
                  />
                  <span className="unidade-tag">mmHg</span>
                </div>
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>Temperatura do Corpo</label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 36.5"
                      value={form.temperatura}
                      onChange={e => setForm({ ...form, temperatura: e.target.value })}
                    />
                    <span>°C</span>
                  </div>
                </div>

                <div className="campo">
                  <label>Oxigenação do Sangue (SpO2)</label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      placeholder="Ex: 98"
                      value={form.saturacaoO2}
                      onChange={e => setForm({ ...form, saturacaoO2: e.target.value })}
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>Batimentos do Coração (Pulso)</label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      placeholder="Ex: 75"
                      value={form.frequenciaCardiaca}
                      onChange={e => setForm({ ...form, frequenciaCardiaca: e.target.value })}
                    />
                    <span>bpm</span>
                  </div>
                </div>

                <div className="campo">
                  <label>Respiração por minuto <small className="opcional-tag">(opcional)</small></label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      placeholder="Ex: 16"
                      value={form.frequenciaRespiratoria}
                      onChange={e => setForm({ ...form, frequenciaRespiratoria: e.target.value })}
                    />
                    <span>irpm</span>
                  </div>
                </div>
              </div>

              <div className="campo-linha">
                <div className="campo">
                  <label>Seu Peso aproximado</label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Ex: 72"
                      value={form.peso}
                      onChange={e => setForm({ ...form, peso: e.target.value })}
                    />
                    <span>kg</span>
                  </div>
                </div>

                <div className="campo">
                  <label>Sua Altura</label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      placeholder="Ex: 170"
                      value={form.altura}
                      onChange={e => setForm({ ...form, altura: e.target.value })}
                    />
                    <span>cm</span>
                  </div>
                </div>

                <div className="campo">
                  <label>Açúcar no Sangue <small className="opcional-tag">(se mediu)</small></label>
                  <div className="input-unidade-box">
                    <input
                      type="number"
                      placeholder="Ex: 95"
                      value={form.glicemia}
                      onChange={e => setForm({ ...form, glicemia: e.target.value })}
                    />
                    <span>mg/dL</span>
                  </div>
                </div>
              </div>

              {/* CARD DE IMC INTELIGENTE CALCULADO NA HORA */}
              {imcAtual && (
                <div className="card-imc-calculado">
                  <span className="imc-icone">⚖️</span>
                  <div>
                    <strong>Seu Índice de Massa Corporal (IMC): {imcAtual} kg/m²</strong>
                    <span className="imc-status">
                      {parseFloat(imcAtual) < 18.5 && 'Classificação: Abaixo do peso ideal'}
                      {parseFloat(imcAtual) >= 18.5 && parseFloat(imcAtual) < 25 && 'Classificação: Peso saudável'}
                      {parseFloat(imcAtual) >= 25 && parseFloat(imcAtual) < 30 && 'Classificação: Sobrepeso'}
                      {parseFloat(imcAtual) >= 30 && 'Classificação: Obesidade'}
                    </span>
                  </div>
                </div>
              )}

              <div className="botoes-linha">
                <button className="btn-secundario" onClick={() => setEtapa(2)}>← Voltar</button>
                <button className="btn-primario btn-grande" onClick={() => setEtapa(4)}>
                  Continuar para Histórico →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: HISTÓRICO DE SAÚDE */}
        {etapa === 4 && (
          <div className="totem-card">
            <div className="totem-card-header">
              <span className="badge-passo">Passo 4 de 4</span>
              <h1>Histórico de Saúde & Remédios</h1>
              <p>Essas informações ajudam a equipe a prescrever medicações com total segurança.</p>
            </div>

            <div className="totem-form">
              <div className="campo">
                <label>Você possui diagnóstico de alguma destas condições?</label>
                <div className="sintomas-grid">
                  {DOENCAS_COMUNS.map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`btn-sintoma-card ${form.doencasPreexistentes.includes(d) ? 'selecionado' : ''}`}
                      onClick={() => toggleDoenca(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="campo">
                <label>Toma algum remédio todo dia? (Se sim, quais?)</label>
                <input
                  type="text"
                  placeholder="Ex: Losartana 50mg, Insulina, Omeprazol..."
                  value={form.medicamentosEmUso}
                  onChange={e => setForm({ ...form, medicamentosEmUso: e.target.value })}
                />
              </div>

              <div className="campo">
                <label>Tem alergia a algum remédio ou alimento?</label>
                <input
                  type="text"
                  placeholder="Ex: Alergia a Dipirona, Penicilina, Iodo, Frutos do mar..."
                  value={form.alergias}
                  onChange={e => setForm({ ...form, alergias: e.target.value })}
                />
              </div>

              {form.sexoBiologico === 'FEMININO' && (
                <div className="box-gestante">
                  <label className="checkbox-rotulo">
                    <input
                      type="checkbox"
                      checked={form.gestante}
                      onChange={e => setForm({ ...form, gestante: e.target.checked })}
                    />
                    Está gestante ou com suspeita de gravidez?
                  </label>
                  {form.gestante && (
                    <div className="campo" style={{ marginTop: '0.8rem' }}>
                      <label>Quantas semanas de gestação?</label>
                      <input
                        type="number"
                        placeholder="Ex: 24"
                        value={form.semanasGestacao}
                        onChange={e => setForm({ ...form, semanasGestacao: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="campo">
                <label>Alguma observação extra que queira deixar para a enfermagem?</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Fiz cirurgia recente, tenho dificuldade de locomoção..."
                  value={form.observacoes}
                  onChange={e => setForm({ ...form, observacoes: e.target.value })}
                />
              </div>

              {erro && <div className="banner-erro">{erro}</div>}

              <div className="botoes-linha">
                <button className="btn-secundario" onClick={() => setEtapa(3)}>← Voltar</button>
                <button
                  className="btn-primario btn-finalizar btn-grande"
                  onClick={enviarTriagem}
                  disabled={carregando}
                >
                  {carregando ? '🤖 Analisando com Protocolo de Manchester...' : '🏥 Finalizar Pré-Triagem'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 5: RESULTADO DO PROTOCOLO DE MANCHESTER */}
        {etapa === 5 && resultado && (
          <div className="totem-card card-resultado-imprimir">
            <div className={`resultado-header ${COR_CLASSE[resultado.cor]}`}>
              <div className="resultado-badge-manchester">
                <span>CLASSIFICAÇÃO DE RISCO MANCHESTER</span>
                <h1>{resultado.cor}</h1>
                <h2>{resultado.prioridade}</h2>
              </div>
              <p className="tempo-alvo">
                ⏱️ {resultado.tempoEspera === 0 ? 'ATENDIMENTO IMEDIATO' : `Tempo máximo recomendado: até ${resultado.tempoEspera} minutos`}
              </p>
            </div>

            <div className="resultado-corpo">
              <div className="resultado-secao">
                <h3>🩺 Justificativa Clínica (Protocolo Internacional)</h3>
                <p>{resultado.justificativa}</p>
              </div>

              <div className="resultado-secao">
                <h3>📋 Conduta Recomendada</h3>
                <p>{resultado.condutaRecomendada}</p>
              </div>

              {resultado.alertaUrgente && (
                <div className="alerta-urgente-box">
                  🚨 <strong>Atenção:</strong> Sua prioridade foi classificada como urgente. O posto de enfermagem já recebeu o alerta em tempo real e você será acolhido rapidamente.
                </div>
              )}

              <div className="botoes-linha botoes-nao-imprimir">
                <button className="btn-secundario" onClick={() => window.print()}>
                  🖨️ Imprimir Comprovante / Senha
                </button>
                <button className="btn-primario" onClick={reiniciar}>
                  Nova Triagem
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Totem
