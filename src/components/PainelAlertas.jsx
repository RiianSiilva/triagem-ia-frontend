import { useState } from 'react'
import api from '../services/api'
import './PainelAlertas.css'

function PainelAlertas({ alertas, removerAlerta }) {
  const [confirmandoIndex, setConfirmandoIndex] = useState(null)
  const [nomeProfissional, setNomeProfissional] = useState('')
  const [carregando, setCarregando] = useState(false)

  if (alertas.length === 0) return null

  async function handleConfirmarAlerta(alerta, index) {
    if (!nomeProfissional.trim()) {
      alert('Informe o seu nome ou registro profissional (COREN/CRM) para assumir.')
      return
    }

    try {
      setCarregando(true)
      if (alerta.triagemId) {
        await api.put(`/triagem/${alerta.triagemId}/confirmar-alerta`, {
          nomeProfissional: nomeProfissional.trim()
        })
      }
      removerAlerta(index)
      setConfirmandoIndex(null)
      setNomeProfissional('')
    } catch (error) {
      console.error('Erro ao confirmar recebimento de alerta:', error)
      alert('Não foi possível registrar no servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="painel-alertas-container">
      {alertas.map((alerta, index) => (
        <div key={index} className={`alerta-toast alerta-${alerta.cor?.toLowerCase()}`}>
          <div className="alerta-toast-icone">
            {alerta.cor === 'VERMELHO' ? '🔴' : '🟠'}
          </div>

          <div className="alerta-toast-info">
            <div className="alerta-header-linha">
              <span className="alerta-tag">CHAMADO CRÍTICO {alerta.cor}</span>
              <button
                className="btn-fechar-alerta"
                title="Ignorar notificação"
                onClick={() => removerAlerta(index)}
              >
                ✕
              </button>
            </div>

            <h4 className="alerta-paciente-nome">{alerta.nomePaciente}</h4>
            <p className="alerta-sintomas-texto">{alerta.sintomas}</p>

            {confirmandoIndex === index ? (
              <div className="alerta-ack-box">
                <input
                  type="text"
                  placeholder="Seu nome / COREN / CRM..."
                  value={nomeProfissional}
                  onChange={e => setNomeProfissional(e.target.value)}
                  autoFocus
                />
                <div className="ack-botoes">
                  <button
                    className="btn-ack-salvar"
                    disabled={carregando}
                    onClick={() => handleConfirmarAlerta(alerta, index)}
                  >
                    {carregando ? 'Salvando...' : 'Confirmar Chamado'}
                  </button>
                  <button
                    className="btn-ack-cancelar"
                    onClick={() => setConfirmandoIndex(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn-assumir-paciente"
                onClick={() => setConfirmandoIndex(index)}
              >
                ✋ Assumir Atendimento
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PainelAlertas
