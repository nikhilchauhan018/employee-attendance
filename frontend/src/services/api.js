import axios from 'axios'
import { STORAGE_KEYS } from '../utils/constants'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

// attach jwt token to every request
api.interceptors.request.use(config => {
  let token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    let msg = err.response?.data?.message || err.message || 'Something went wrong'

    // auto logout on 401
    if (err.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      window.location.href = '/login'
    }

    return Promise.reject(new Error(msg))
  }
)

export default api
