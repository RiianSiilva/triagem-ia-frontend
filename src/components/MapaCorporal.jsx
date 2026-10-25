import { useState } from 'react'
import './MapaCorporal.css'

// 5 Cores do Protocolo de Manchester para intensidade de dor
export const CORES_MANCHESTER_DOR = [
  { cor: 'AZUL', label: 'Leve', valor: 2, hex: '#2563eb', desc: 'Incômodo leve (1-3)' },
  { cor: 'VERDE', label: 'Moderada', valor: 5, hex: '#16a34a', desc: 'Dói mas suportável (4-6)' },
  { cor: 'AMARELO', label: 'Intensa', valor: 7, hex: '#ca8a04', desc: 'Dor forte, limita movimentos (7-8)' },
  { cor: 'LARANJA', label: 'Muito Forte', valor: 9, hex: '#ea580c', desc: 'Dor severa, difícil suportar (9)' },
  { cor: 'VERMELHO', label: 'Insuportável', valor: 10, hex: '#dc2626', desc: 'Pior dor possível / Emergência (10)' }
]

function MapaCorporal({ localSelecionado, onSelectLocal, nivelDorSelecionado, onSelectDor }) {
  const [parteAtiva, setParteAtiva] = useState(null)
  const [doresPorRegiao, setDoresPorRegiao] = useState({})

  // Ao clicar numa região do corpo (frente ou costas)
  function handleRegiaoClick(id, nomeAmigavel) {
    setParteAtiva({ id, nome: nomeAmigavel })
    onSelectLocal(nomeAmigavel)
  }

  // Ao escolher a cor de Manchester para a parte ativa
  function handleCorClick(opcao) {
    if (!parteAtiva) return
    const novaDores = {
      ...doresPorRegiao,
      [parteAtiva.id]: opcao
    }
    setDoresPorRegiao(novaDores)
    onSelectDor(opcao.valor)
  }

  function getCorPreenchimento(id) {
    if (doresPorRegiao[id]) {
      return doresPorRegiao[id].hex
    }
    if (parteAtiva?.id === id) {
      return '#38bdf8' // azul claro indicando selecionado aguardando cor
    }
    return '#334155' // cor padrão silhueta escura
  }

  return (
    <div className="mapa-corporal-container">
      <div className="mapa-instrucao">
        <span className="instrucao-passo">Passo 1:</span> Toque na região do corpo onde dói &nbsp;|&nbsp; 
        <span className="instrucao-passo">Passo 2:</span> Escolha a cor da intensidade (Protocolo de Manchester)
      </div>

      <div className="mapa-silhuetas-wrapper">
        {/* SILHUETA FRENTE */}
        <div className="silhueta-coluna">
          <span className="silhueta-titulo">VISÃO DE FRENTE</span>
          <svg viewBox="0 0 200 420" className="silhueta-svg">
            {/* Cabeça / Rosto */}
            <path
              id="cabeca_frente"
              className="parte-corpo-path"
              d="M100 20 C85 20, 75 35, 75 55 C75 75, 85 90, 100 90 C115 90, 125 75, 125 55 C125 35, 115 20, 100 20 Z"
              fill={getCorPreenchimento('cabeca_frente')}
              onClick={() => handleRegiaoClick('cabeca_frente', 'Cabeça / Rosto (Frente)')}
            />
            {/* Pescoço */}
            <rect
              id="pescoco_frente"
              className="parte-corpo-path"
              x="92" y="90" width="16" height="15" rx="3"
              fill={getCorPreenchimento('pescoco_frente')}
              onClick={() => handleRegiaoClick('pescoco_frente', 'Pescoço / Garganta')}
            />
            {/* Tronco / Peito */}
            <path
              id="peito_frente"
              className="parte-corpo-path"
              d="M72 105 L128 105 L122 165 L78 165 Z"
              fill={getCorPreenchimento('peito_frente')}
              onClick={() => handleRegiaoClick('peito_frente', 'Peito / Tórax')}
            />
            {/* Abdômen / Barriga */}
            <path
              id="abdomen_frente"
              className="parte-corpo-path"
              d="M78 166 L122 166 L118 220 L82 220 Z"
              fill={getCorPreenchimento('abdomen_frente')}
              onClick={() => handleRegiaoClick('abdomen_frente', 'Abdômen / Barriga')}
            />
            {/* Braço Direito (anatomia: lado esquerdo da imagem) */}
            <path
              id="braco_dir_frente"
              className="parte-corpo-path"
              d="M70 106 L50 115 L38 185 L50 188 L60 135 L70 125 Z"
              fill={getCorPreenchimento('braco_dir_frente')}
              onClick={() => handleRegiaoClick('braco_dir_frente', 'Braço Direito')}
            />
            {/* Antebraço / Mão Direita */}
            <path
              id="mao_dir_frente"
              className="parte-corpo-path"
              d="M37 186 L28 250 L40 252 L49 189 Z"
              fill={getCorPreenchimento('mao_dir_frente')}
              onClick={() => handleRegiaoClick('mao_dir_frente', 'Mão / Punho Direito')}
            />
            {/* Braço Esquerdo (anatomia: lado direito da imagem) */}
            <path
              id="braco_esq_frente"
              className="parte-corpo-path"
              d="M130 106 L150 115 L162 185 L150 188 L140 135 L130 125 Z"
              fill={getCorPreenchimento('braco_esq_frente')}
              onClick={() => handleRegiaoClick('braco_esq_frente', 'Braço Esquerdo')}
            />
            {/* Antebraço / Mão Esquerda */}
            <path
              id="mao_esq_frente"
              className="parte-corpo-path"
              d="M163 186 L172 250 L160 252 L151 189 Z"
              fill={getCorPreenchimento('mao_esq_frente')}
              onClick={() => handleRegiaoClick('mao_esq_frente', 'Mão / Punho Esquerdo')}
            />
            {/* Perna Direita (Coxa / Joelho) */}
            <path
              id="coxa_dir_frente"
              className="parte-corpo-path"
              d="M83 222 L98 222 L96 310 L78 310 Z"
              fill={getCorPreenchimento('coxa_dir_frente')}
              onClick={() => handleRegiaoClick('coxa_dir_frente', 'Coxa / Quadril Direito')}
            />
            {/* Perna Direita (Canela / Pé) */}
            <path
              id="pe_dir_frente"
              className="parte-corpo-path"
              d="M78 312 L96 312 L93 395 L65 398 L65 390 L76 385 Z"
              fill={getCorPreenchimento('pe_dir_frente')}
              onClick={() => handleRegiaoClick('pe_dir_frente', 'Perna / Pé Direito')}
            />
            {/* Perna Esquerda (Coxa / Joelho) */}
            <path
              id="coxa_esq_frente"
              className="parte-corpo-path"
              d="M102 222 L117 222 L122 310 L104 310 Z"
              fill={getCorPreenchimento('coxa_esq_frente')}
              onClick={() => handleRegiaoClick('coxa_esq_frente', 'Coxa / Quadril Esquerdo')}
            />
            {/* Perna Esquerda (Canela / Pé) */}
            <path
              id="pe_esq_frente"
              className="parte-corpo-path"
              d="M104 312 L122 312 L124 385 L135 390 L135 398 L107 395 Z"
              fill={getCorPreenchimento('pe_esq_frente')}
              onClick={() => handleRegiaoClick('pe_esq_frente', 'Perna / Pé Esquerdo')}
            />
          </svg>
        </div>

        {/* SILHUETA COSTAS */}
        <div className="silhueta-coluna">
          <span className="silhueta-titulo">VISÃO DE COSTAS</span>
          <svg viewBox="0 0 200 420" className="silhueta-svg">
            {/* Cabeça / Nuca */}
            <path
              id="cabeca_costas"
              className="parte-corpo-path"
              d="M100 20 C85 20, 75 35, 75 55 C75 75, 85 90, 100 90 C115 90, 125 75, 125 55 C125 35, 115 20, 100 20 Z"
              fill={getCorPreenchimento('cabeca_costas')}
              onClick={() => handleRegiaoClick('cabeca_costas', 'Nuca / Cabeça (Costas)')}
            />
            {/* Pescoço Posterior */}
            <rect
              id="pescoco_costas"
              className="parte-corpo-path"
              x="92" y="90" width="16" height="15" rx="3"
              fill={getCorPreenchimento('pescoco_costas')}
              onClick={() => handleRegiaoClick('pescoco_costas', 'Pescoço Posterior')}
            />
            {/* Costas Superior (Dorsal / Ombros) */}
            <path
              id="costas_superior"
              className="parte-corpo-path"
              d="M72 105 L128 105 L122 165 L78 165 Z"
              fill={getCorPreenchimento('costas_superior')}
              onClick={() => handleRegiaoClick('costas_superior', 'Costas Superior / Ombros')}
            />
            {/* Lombar / Coluna Baixa */}
            <path
              id="lombar_costas"
              className="parte-corpo-path"
              d="M78 166 L122 166 L118 220 L82 220 Z"
              fill={getCorPreenchimento('lombar_costas')}
              onClick={() => handleRegiaoClick('lombar_costas', 'Lombar / Coluna')}
            />
            {/* Braço Esquerdo (Costas) */}
            <path
              id="braco_esq_costas"
              className="parte-corpo-path"
              d="M70 106 L50 115 L38 185 L50 188 L60 135 L70 125 Z"
              fill={getCorPreenchimento('braco_esq_costas')}
              onClick={() => handleRegiaoClick('braco_esq_costas', 'Braço Esquerdo (Costas)')}
            />
            <path
              id="mao_esq_costas"
              className="parte-corpo-path"
              d="M37 186 L28 250 L40 252 L49 189 Z"
              fill={getCorPreenchimento('mao_esq_costas')}
              onClick={() => handleRegiaoClick('mao_esq_costas', 'Mão Esquerda (Costas)')}
            />
            {/* Braço Direito (Costas) */}
            <path
              id="braco_dir_costas"
              className="parte-corpo-path"
              d="M130 106 L150 115 L162 185 L150 188 L140 135 L130 125 Z"
              fill={getCorPreenchimento('braco_dir_costas')}
              onClick={() => handleRegiaoClick('braco_dir_costas', 'Braço Direito (Costas)')}
            />
            <path
              id="mao_dir_costas"
              className="parte-corpo-path"
              d="M163 186 L172 250 L160 252 L151 189 Z"
              fill={getCorPreenchimento('mao_dir_costas')}
              onClick={() => handleRegiaoClick('mao_dir_costas', 'Mão Direita (Costas)')}
            />
            {/* Glúteos / Perna Direita (Costas) */}
            <path
              id="perna_dir_costas"
              className="parte-corpo-path"
              d="M83 222 L98 222 L96 310 L78 310 Z"
              fill={getCorPreenchimento('perna_dir_costas')}
              onClick={() => handleRegiaoClick('perna_dir_costas', 'Glúteo / Perna Direita (Costas)')}
            />
            <path
              id="panturrilha_dir_costas"
              className="parte-corpo-path"
              d="M78 312 L96 312 L93 395 L75 398 L75 385 Z"
              fill={getCorPreenchimento('panturrilha_dir_costas')}
              onClick={() => handleRegiaoClick('panturrilha_dir_costas', 'Panturrilha / Calcanhar Direito')}
            />
            {/* Glúteos / Perna Esquerda (Costas) */}
            <path
              id="perna_esq_costas"
              className="parte-corpo-path"
              d="M102 222 L117 222 L122 310 L104 310 Z"
              fill={getCorPreenchimento('perna_esq_costas')}
              onClick={() => handleRegiaoClick('perna_esq_costas', 'Glúteo / Perna Esquerda (Costas)')}
            />
            <path
              id="panturrilha_esq_costas"
              className="parte-corpo-path"
              d="M104 312 L122 312 L124 385 L125 398 L107 395 Z"
              fill={getCorPreenchimento('panturrilha_esq_costas')}
              onClick={() => handleRegiaoClick('panturrilha_esq_costas', 'Panturrilha / Calcanhar Esquerdo')}
            />
          </svg>
        </div>
      </div>

      {/* SELETOR DE COR DE MANCHESTER PARA A REGIÃO SELECIONADA */}
      <div className="painel-seletor-manchester">
        <div className="seletor-cabecalho">
          {parteAtiva ? (
            <span>📍 Região selecionada: <strong>{parteAtiva.nome}</strong></span>
          ) : (
            <span className="aviso-toque">👆 Toque em uma parte do corpo acima para indicar onde dói</span>
          )}
        </div>

        <div className="botoes-manchester-grid">
          {CORES_MANCHESTER_DOR.map(op => (
            <button
              key={op.cor}
              type="button"
              className={`btn-manchester-cor btn-${op.cor.toLowerCase()}`}
              onClick={() => handleCorClick(op)}
              disabled={!parteAtiva}
            >
              <span className="cor-circulo" style={{ backgroundColor: op.hex }} />
              <div className="cor-textos">
                <strong>{op.label}</strong>
                <small>{op.desc}</small>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-limpar-dor"
          onClick={() => {
            setParteAtiva(null)
            setDoresPorRegiao({})
            onSelectLocal('Não especificado / Geral')
            onSelectDor(0)
          }}
        >
          Limpar Seleção / Não sinto dor localizada
        </button>
      </div>
    </div>
  )
}

export default MapaCorporal
