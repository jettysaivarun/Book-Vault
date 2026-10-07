import axios from 'axios'

/*
========================================
BACKEND URL
========================================

LOCAL:
http://127.0.0.1:8000

VERCEL:
VITE_API_URL will contain your Render backend URL
*/

const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/*
========================================
ATTACH ACCESS TOKEN
========================================
*/

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem('access_token')

    const isAuthRequest =
      config.url?.includes('/api/auth/login/') ||
      config.url?.includes('/api/auth/register/') ||
      config.url?.includes('/api/auth/check_user/') ||
      config.url?.includes('/api/token/refresh/')

    if (accessToken && !isAuthRequest) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/*
========================================
AUTOMATIC ACCESS TOKEN REFRESH
========================================
*/

api.interceptors.response.use(
  (response) => {
    return response
  },

  async (error) => {
    const originalRequest = error.config

    /*
    Only refresh when:
    - Server returns 401
    - Request hasn't already been retried
    */

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error)
    }

    const refreshToken =
      localStorage.getItem('refresh_token')

    /*
    No refresh token
    */

    if (!refreshToken) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('username')

      window.location.href = '/login'

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      /*
      IMPORTANT:
      Use the same api instance so that
      localhost/Render is selected automatically.
      */

      const response = await api.post(
        '/api/token/refresh/',
        {
          refresh: refreshToken,
        }
      )

      const newAccessToken =
        response.data.access

      localStorage.setItem(
        'access_token',
        newAccessToken
      )

      /*
      Attach new token to original request
      */

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      /*
      Retry original request
      */

      return api(originalRequest)

    } catch (refreshError) {

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('username')

      window.location.href = '/login'

      return Promise.reject(refreshError)
    }
  }
)

/*
========================================
LOGOUT
========================================
*/

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token')

  try {
    if (refreshToken) {
      await api.post('/api/auth/logout/', {
        refresh: refreshToken,
      })
    }
  } catch (error) {
    console.error('Logout request failed:', error)
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('email')

    window.location.href = '/login'
  }
}

export default api