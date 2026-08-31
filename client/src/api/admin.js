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

export async function fetchAllUsers(){
  const { data } = await api.get('/admin/users')
  return data
}

export async function fetchAllPickups(){
  const { data } = await api.get('/admin/pickups')
  return data
}

export async function fetchPickupsAsPerStatus(status, state){
  const { data } = await api.get('/admin/pickups-status', {
    params: {
      status,
      state,
    },
  })
  return data
}