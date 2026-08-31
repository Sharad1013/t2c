import axios from 'axios'

const inspectorApi = axios.create({
  baseURL: '/api/v1',
})

inspectorApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('t2c_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

inspectorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export async function registerInspector(formData) {
  const { data } = await inspectorApi.post('/inspectors/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function loginInspector(credentials) {
  const { data } = await inspectorApi.post('/inspectors/login', credentials)
  return data
}

export async function getLoggedInInspector() {
  const { data } = await inspectorApi.get('/inspectors/me')
  return data
}

export async function toggleInspectorAvailability() {
  const { data } = await inspectorApi.patch('/inspectors/availability')
  return data
}

export async function updateInspectorProfile(formData) {
  const { data } = await inspectorApi.patch('/inspectors/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
