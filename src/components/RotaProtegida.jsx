import { Navigate } from 'react-router-dom'

function RotaProtegida({ children, perfisPermitidos = [] }) {
  const token = localStorage.getItem('token')
  const usuarioRaw = localStorage.getItem('usuario')

  // Se não estiver logado, vai pro Login
  if (!token) {
    return <Navigate to="/" replace />
  }

  // Se houver restrição de perfil
  if (perfisPermitidos.length > 0 && usuarioRaw) {
    try {
      const usuario = JSON.parse(usuarioRaw)
      if (usuario.perfil && !perfisPermitidos.includes(usuario.perfil)) {
        // Redireciona para sua página padrão
        if (usuario.perfil === 'PACIENTE') return <Navigate to="/totem" replace />
        return <Navigate to="/painel" replace />
      }
    } catch (e) {}
  }

  return children
}

export default RotaProtegida
