import api from './client'

export async function fetchLiveResaleProducts() {
  const { data } = await api.get('/resale/live')
  return data
}

export async function fetchMyResaleProducts() {
  const { data } = await api.get('/resale/my-products')
  return data
}

export async function fetchResaleProductDetails(productId) {
  const { data } = await api.get(`/resale/${productId}`)
  return data
}

export async function createResaleProduct(fields, imageFiles) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  imageFiles.forEach((file) => {
    formData.append('images', file)
  })

  const { data } = await api.post('/resale', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function deleteResaleProduct(productId) {
  const { data } = await api.delete(`/resale/${productId}`)
  return data
}
