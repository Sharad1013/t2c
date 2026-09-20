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