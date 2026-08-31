export const WASTE_TYPES = [
  { id: 'plastic', label: 'Plastic', icon: '♻️', coins: 15 },
  { id: 'paper', label: 'Paper & Cardboard', icon: '📄', coins: 12 },
  { id: 'metal', label: 'Metal', icon: '🔩', coins: 20 },
  { id: 'glass', label: 'Glass', icon: '🫙', coins: 10 },
  { id: 'organic', label: 'Organic', icon: '🌿', coins: 8 },
  { id: 'mixed', label: 'Mixed Dry Waste', icon: '🗑️', coins: 10 },
]

export const PICKUP_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  assigned: { label: 'Inspector Assigned', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  picked_up: { label: 'Picked Up', color: 'bg-t2c-500/20 text-t2c-300 border-t2c-500/30' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  delivered: { label: 'Delivered', color: 'border-t2c-500/30 bg-t2c-500/10 text-t2c-400' },
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh',
]

export const DELETE_WINDOW_MS = 3 * 60 * 1000

export const VEHICLE_TYPES = [
  { id: 'bike', label: 'Bike / Scooter' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'mini_van', label: 'Mini Van' },
  { id: 'auto', label: 'Auto Rickshaw' },
  { id: 'pickup_truck', label: 'Pickup Truck' },
]

export const INSPECTOR_STATUS = {
  pending: { label: 'Pending Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  under_review: { label: 'Under Review', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  approved: { label: 'Approved', color: 'bg-t2c-500/20 text-t2c-300 border-t2c-500/30' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  suspended: { label: 'Suspended', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
}
