import api from './client'

export async function fetchAllInspectors() {
  const { data } = await api.get('/admin/inspectors')
  return data
}

export async function fetchInspectorsAsPerStatus(status) {
  const { data } = await api.get('/admin/pending-inspectors', {
    params: { status },
  })
  return data
}

export async function approveRejectPendingInspectors(inspectorId, status) {
  const { data } = await api.patch(`/admin/inspectors/${inspectorId}`, { status })
  return data
}

export async function fetchAllUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function deleteUser(userIdToDelete) {
  const { data } = await api.delete(`/admin/users/${userIdToDelete}`)
  return data
}

export async function fetchAllPickups() {
  const { data } = await api.get('/admin/pickups')
  return data
}

export async function fetchPickupsAsPerStatus(status, state, inspectorId) {
  const { data } = await api.get('/admin/pickups-status', {
    params: {
      status,
      state,
      inspectorId
    },
  })
  return data
}

export async function fetchAdminProducts() {
  const { data } = await api.get('/admin/products')
  return data
}

export async function fetchAdminProductDetails(productId) {
  const { data } = await api.get(`/admin/products/${productId}`)
  return data
}

export async function createAdminProduct(fields, images) {
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value)
    }
  })
  images.forEach((file) => formData.append('images', file))

  const { data } = await api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateAdminProduct(productId, fields = {}, images = []) {
  if (images.length) {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, String(value))
      }
    })
    images.forEach((file) => formData.append('images', file))
    const { data } = await api.patch(`/admin/products/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  const { data } = await api.patch(`/admin/products/${productId}`, fields)
  return data
}

export async function deleteAdminProduct(productId) {
  const { data } = await api.delete(`/admin/products/${productId}`)
  return data
}