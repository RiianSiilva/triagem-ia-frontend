import axios from 'axios'

const api = axios.create({
  baseURL: 'https://triagem-ia-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adiciona token JWT automaticamente em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
