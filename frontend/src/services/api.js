import axios from 'axios'

const api = axios.create({
baseURL: 'http://127.0.0.1:8000',
headers: {
'Content-Type': 'application/json',
},
})

/* ========================================
ATTACH ACCESS TOKEN
======================================== */

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

/* ========================================
AUTOMATIC ACCESS TOKEN REFRESH
======================================== */

api.interceptors.response.use(
(response) => {
return response
},

async (error) => {
const originalRequest = error.config


if (
  error.response?.status !== 401 ||
  originalRequest?._retry
) {
  return Promise.reject(error)
}

const refreshToken =
  localStorage.getItem('refresh_token')

if (!refreshToken) {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')

  window.location.href = '/login'

  return Promise.reject(error)
}

originalRequest._retry = true

try {
  const response = await axios.post(
    'http://127.0.0.1:8000/api/token/refresh/',
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

  originalRequest.headers.Authorization =
    `Bearer ${newAccessToken}`

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

/* ========================================
LOGOUT
======================================== */

export const logout = () => {
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
localStorage.removeItem('username')

window.location.href = '/login'
}

export default api
