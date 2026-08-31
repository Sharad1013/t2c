import api from './client'

export async function createPickup({ wasteTypes, notes, images }) {
  const formData = new FormData()
  wasteTypes.forEach((type) => formData.append('wasteTypes', type))
  if (notes) formData.append('notes', notes)
  if (images?.length) {
    images.forEach((file) => formData.append('images', file))
  }

  const { data } = await api.post('/pickups/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getPickupHistory() {
  const { data } = await api.get('/pickups/')
  return data
}

export async function deletePickup(pickupId) {
  const { data } = await api.delete(`/pickups/${pickupId}`)
  return data
}

export async function updatePickupStatus(pickupId, inspectorId) {
  const { data } = await api.patch(`/pickups/${pickupId}`)
  return data
}

export async function verifyPickupOtp(pickupId, otp) {
  const { data } = await api.patch(`/pickups/${pickupId}/verify-otp`, { otp })
  return data
}

export async function getPickupsPerInspector(inspectorId) {
  const { data } = await api.get(`/pickups/${inspectorId}`)
  return data
}

export async function updatePickupStatusToDelivered(pickupId, inspectorId, images) {
  const formData = new FormData()
  if (images?.length) {
    images.forEach((file) => formData.append('images', file))
  }

  const { data } = await api.patch(`/pickups/delivered/${pickupId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}