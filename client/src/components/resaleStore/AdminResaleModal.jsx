import { useState } from 'react'
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  Coins,
  DollarSign,
  Loader2,
  Trash2,
} from 'lucide-react'
import { updateAdminResaleProduct, deleteAdminResaleProduct } from '../../api/admin'
import Alert from '../Alert'
import { RESALE_STATUS } from '../../utils/constants'

export default function AdminResaleModal({ product, onClose, onUpdated, onDeleted }) {
  const [activeTab, setActiveTab] = useState(
    product.status === 'live' ? 'edit' : 'approve'
  )

  // Default dates: today and +30 days
  const todayStr = new Date().toISOString().split('T')[0]
  const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const [price, setPrice] = useState(product.price ?? '')
  const [liveFrom, setLiveFrom] = useState(
    product.liveFrom ? new Date(product.liveFrom).toISOString().split('T')[0] : todayStr
  )
  const [liveTill, setLiveTill] = useState(
    product.liveTill ? new Date(product.liveTill).toISOString().split('T')[0] : in30DaysStr
  )
  const [stock, setStock] = useState(product.stock ?? 1)
  const [name, setName] = useState(product.name || '')
  const [brand, setBrand] = useState(product.brand || '')
  const [rejectionReason, setRejectionReason] = useState(product.rejectionReason || '')
  const [otherStatus, setOtherStatus] = useState('sold')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleMakeLive = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const numPrice = Number(price)
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setError('A valid positive price is required to publish this product live.')
      return
    }

    if (!liveFrom || !liveTill) {
      setError('Both Live From and Live Till dates are required.')
      return
    }

    if (new Date(liveTill) <= new Date(liveFrom)) {
      setError('Live Till date must be after Live From date.')
      return
    }

    setSaving(true)
    try {
      const data = await updateAdminResaleProduct(product._id, {
        status: 'live',
        price: numPrice,
        liveFrom: new Date(liveFrom).toISOString(),
        liveTill: new Date(liveTill).toISOString(),
        stock: Number(stock) || 1,
        name: name.trim() || product.name,
        brand: brand.trim() || undefined,
      })
      setSuccess('Product marked LIVE successfully!')
      onUpdated?.(data.resaleProduct || data.product)
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!rejectionReason.trim()) {
      setError('A rejection reason is required so the seller understands why.')
      return
    }

    setSaving(true)
    try {
      const data = await updateAdminResaleProduct(product._id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
      })
      setSuccess('Product marked as REJECTED.')
      onUpdated?.(data.resaleProduct || data.product)
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const data = await updateAdminResaleProduct(product._id, { status })
      setSuccess(`Status updated to ${status}.`)
      onUpdated?.(data.resaleProduct || data.product)
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete listing "${product.name}"?`)) return
    setDeleting(true)
    setError('')
    try {
      await deleteAdminResaleProduct(product._id)
      onDeleted?.(product._id)
      onClose()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const statusMeta = RESALE_STATUS[product.status] || {
    label: product.status,
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Resale Review
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Review & Activate Listing</h2>
            <p className="mt-1 text-xs text-slate-400">
              Set store pricing and activate the listing to make it visible to normal users & inspectors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mt-4">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Product Snapshot Info */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex gap-4">
            {product.imageUrls?.[0] ? (
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="h-20 w-20 rounded-xl object-cover shrink-0 border border-white/10"
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusMeta.color}`}>
                  Current: {statusMeta.label}
                </span>
                {product.seller && (
                  <span className="text-[11px] text-slate-400 truncate">
                    Seller: <strong className="text-slate-200">{product.seller.firstName} {product.seller.lastName || ''}</strong> ({product.seller.email || '—'})
                  </span>
                )}
              </div>
              <h4 className="font-display text-base font-semibold text-white mt-1 truncate">
                {product.name}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {product.brand && <span>Brand: <strong className="text-slate-300">{product.brand}</strong></span>}
                <span>Stock: <strong className="text-slate-300">{product.stock ?? 1}</strong></span>
                {product.aiAnalysis?.category && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI: {product.aiAnalysis.category}
                  </span>
                )}
                {product.estimatedResaleCoins ? (
                  <span className="text-coin-400 flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    ~{product.estimatedResaleCoins} Est. Coins
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="mt-6 flex border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('approve')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'approve'
                ? 'border-t2c-400 text-t2c-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Make Live / Activate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reject')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'reject'
                ? 'border-red-400 text-red-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="h-4 w-4" />
            Reject Listing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'status'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Other Statuses & Danger
          </button>
        </div>

        {/* Tab 1: Make Live / Activate */}
        {activeTab === 'approve' && (
          <form onSubmit={handleMakeLive} className="mt-5 space-y-4">
            <div className="rounded-xl border border-t2c-500/20 bg-t2c-500/5 p-3 text-xs text-t2c-300">
              💡 <strong>Publishing Live:</strong> Marking active will immediately display this product on the public Resale Store for all users and inspectors.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Resale Price (INR ₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-8 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-t2c-500 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ~{price ? Math.round(Number(price) * 20) : 0} TrashCoins equivalent
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Stock / Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-t2c-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Live From Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={liveFrom}
                  onChange={(e) => setLiveFrom(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white focus:border-t2c-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Live Till Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={liveTill}
                  onChange={(e) => setLiveTill(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white focus:border-t2c-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:from-t2c-400 hover:to-emerald-500 transition shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve & Make Live
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Reject */}
        {activeTab === 'reject' && (
          <form onSubmit={handleReject} className="mt-5 space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
              ⚠️ <strong>Rejection Notice:</strong> This will reject the submission and inform the seller with the reason provided below.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1.5">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Item photos are blurry / Damaged condition does not meet resale standards / Duplicate listing"
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Other Statuses & Danger Delete */}
        {activeTab === 'status' && (
          <div className="mt-5 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-2">
                Quick Status Transitions
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('sold')}
                  disabled={saving}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
                >
                  Mark as Sold
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('expired')}
                  disabled={saving}
                  className="rounded-xl border border-slate-500/30 bg-slate-500/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-500/20 transition"
                >
                  Mark as Expired
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('pending_review')}
                  disabled={saving}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  Reset to Pending Review
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-semibold text-red-400 mb-1">Delete Listing</h4>
              <p className="text-xs text-slate-400 mb-3">
                Permanently removes this product and all associated records from the database.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? 'Deleting...' : 'Delete Product Permanently'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
