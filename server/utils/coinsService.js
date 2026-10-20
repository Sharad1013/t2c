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

export function estimateResaleCoins(category) {
  const coinMap = {
    electronics: 50,
    furniture: 40,
    appliances: 45,
    clothing: 15,
    books: 10,
    toys: 12,
  }
  return coinMap[category] || 20
}