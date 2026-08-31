import api from './client.js'

export async function getNotifications({ unreadOnly = false } = {}) {
  const { data } = await api.get('/notifications', { params: { unreadOnly } })
  return data
}

export async function markNotificationsAsRead(ids = []) {
  const { data } = await api.patch('/notifications/read', { ids })
  return data
}
