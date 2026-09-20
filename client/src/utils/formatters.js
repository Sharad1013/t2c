export function formatInr(amount, currency = 'INR') {
  const value = Number(amount)
  if (Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function estimateCoins(wasteTypes) {
  const coinMap = {
    plastic: 15,
    paper: 12,
    metal: 20,
    glass: 10,
    organic: 8,
    mixed: 10,
  }
  if (!wasteTypes?.length) return 0
  return wasteTypes.reduce((sum, type) => sum + (coinMap[type] || 10), 0)
}

export function canDeletePickup(createdAt) {
  if (!createdAt) return false
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff <= 3 * 60 * 1000
}

export function deleteTimeRemaining(createdAt) {
  if (!createdAt) return 0
  const remaining = 10 * 1000 - (Date.now() - new Date(createdAt).getTime())
  return Math.max(0, Math.ceil(remaining / 1000))
}
