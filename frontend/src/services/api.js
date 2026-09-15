import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { useToastStore } = await import('../stores/toast')
    const toast = useToastStore()

    if (!error.response) {
      toast.error(
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Unable to reach the server. Check your connection.',
      )
      return Promise.reject(error)
    }

    const isAuthEndpoint = ['/auth/login', '/auth/register'].some((path) =>
      error.config?.url?.includes(path),
    )
    if (error.response.status === 401 && !isAuthEndpoint && localStorage.getItem('token')) {
      const { useAuthStore } = await import('../stores/auth')
      useAuthStore().logout()
      toast.error('Session expired — please log in again.')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
