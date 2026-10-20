import { useEffect, useState } from 'react'
import {
  X,
  MapPin,
  Sparkles,
  Coins,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Trash2,
  Tag,
  Phone,
  Mail,
} from 'lucide-react'
import { fetchResaleProductDetails, deleteResaleProduct } from '../../api/resale'
import LoadingSpinner from '../LoadingSpinner'
import Alert from '../Alert'
import { RESALE_STATUS } from '../../utils/constants'

export default function ResaleProductDetailModal({
  productId,
  onClose,
  currentUserId,
  isAdmin = false,
  onAdminAction,
  onProductDeleted,
}) {
  const [product, setProduct] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setError('')
    fetchResaleProductDetails(productId)
      .then((data) => {
        setProduct(data.product || data.foundProduct)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [productId])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resale listing?')) return
    setDeleting(true)
    try {
      await deleteResaleProduct(productId)
      onProductDeleted?.(productId)
      onClose()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const isOwner =
    currentUserId &&
    product?.seller &&
    (product.seller._id === currentUserId || product.seller === currentUserId)

  const statusMeta = product?.status
    ? RESALE_STATUS[product.status] || {
        label: product.status,
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      }
    : null

  const isLive = product?.status === 'live'
  const isRejected = product?.status === 'rejected'
  const isPending = product?.status === 'pending_review'

  const formatDate = (val) => {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl my-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-950/80 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8">
            <Alert type="error" message={error} />
          </div>
        ) : !product ? (
          <div className="p-8 text-center text-slate-400">Product not found.</div>
        ) : (
          <div>
            {/* Gallery Section */}
            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden sm:aspect-[21/9]">
              {product.imageUrls?.[activeImageIndex] ? (
                <img
                  src={product.imageUrls[activeImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600">
                  <Tag className="h-12 w-12" />
                </div>
              )}

              {/* Status Ribbon */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-lg ${statusMeta?.color}`}
                >
                  {isLive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : isPending ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : isRejected ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : null}
                  {statusMeta?.label}
                </span>
              </div>

              {/* Thumbnail Strip */}
              {product.imageUrls?.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl bg-black/60 backdrop-blur-md p-1.5">
                  {product.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-12 w-12 overflow-hidden rounded-xl border-2 transition ${
                        activeImageIndex === i ? 'border-t2c-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Rejection Alert if rejected */}
              {isRejected && product.rejectionReason && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-200">Listing Rejected by Admin</h4>
                      <p className="mt-1 text-sm text-red-300/90">{product.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Header Title & Pricing */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  {product.brand && (
                    <p className="text-xs font-bold uppercase tracking-wider text-t2c-400">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="font-display text-2xl font-bold text-white mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Listed on {formatDate(product.createdAt)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  {product.price !== undefined && product.price !== null ? (
                    <div>
                      <p className="font-display text-2xl font-bold text-white">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Equivalent to ~{Math.round(Number(product.price) * 20)} TrashCoins
                      </p>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                      <Clock className="h-3.5 w-3.5" />
                      Awaiting Admin Pricing
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-300">
                    Stock available:{' '}
                    <span className="font-semibold text-white">{product.stock ?? 1} unit(s)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description & Condition
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                    {product.description}
                  </p>
                </div>
              )}

              {/* AI Valuation & Insights Panel */}
              {(product.aiAnalysis || product.estimatedResaleCoins) && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h4 className="font-display text-sm font-semibold text-emerald-300">
                      Gemini AI Analysis & Valuation
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {product.aiAnalysis?.category && (
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
                        <span className="text-slate-400">Detected Category</span>
                        <p className="font-semibold text-white capitalize mt-0.5">
                          {product.aiAnalysis.category}
                        </p>
                      </div>
                    )}

                    {product.estimatedResaleCoins ? (
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
                        <span className="text-slate-400">Estimated Coins</span>
                        <p className="font-semibold text-coin-300 flex items-center gap-1 mt-0.5">
                          <Coins className="h-3.5 w-3.5 text-coin-400" />
                          {product.estimatedResaleCoins} Coins
                        </p>
                      </div>
                    ) : null}

                    {product.aiAnalysis?.confidence && (
                      <div className="rounded-xl bg-slate-950/60 p-3 border border-white/5">
                        <span className="text-slate-400">AI Confidence</span>
                        <p className="font-semibold text-white capitalize mt-0.5">
                          {product.aiAnalysis.confidence}
                        </p>
                      </div>
                    )}
                  </div>

                  {product.aiAnalysis?.description && (
                    <p className="mt-3 text-xs text-emerald-200/80 italic">
                      "{product.aiAnalysis.description}"
                    </p>
                  )}
                </div>
              )}

              {/* Location & Seller Meta */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                    <MapPin className="h-4 w-4 text-t2c-400" />
                    Pickup Location
                  </span>
                  {product.location?.address ? (
                    <p className="text-slate-200">{product.location.address}</p>
                  ) : null}
                  {product.location?.coordinates && (
                    <p className="text-slate-400 mt-1 font-mono text-[11px]">
                      Coordinates: [Lng: {product.location.coordinates[0]}, Lat: {product.location.coordinates[1]}]
                    </p>
                  )}
                </div>

                {/* Seller or Verification Window */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Seller Information
                  </span>
                  {product.seller ? (
                    <div>
                      <p className="text-slate-200 font-medium">
                        {product.seller.firstName} {product.seller.lastName || ''}
                      </p>
                      {product.seller.email && (
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {product.seller.email}
                        </p>
                      )}
                      {product.seller.phone && (
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {product.seller.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400">Verified User</p>
                  )}

                  {isLive && product.liveTill && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-t2c-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Live until {formatDate(product.liveTill)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div>
                  {isOwner && (isPending || isRejected) && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deleting ? 'Deleting...' : 'Delete Listing'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onAdminAction?.(product)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2 text-xs font-semibold text-white transition shadow-md"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Review & Status
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
