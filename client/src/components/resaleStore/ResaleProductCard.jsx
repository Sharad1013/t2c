import { Sparkles, MapPin, Tag, Coins, Eye, Trash2, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { RESALE_STATUS } from '../../utils/constants'

export default function ResaleProductCard({
  product,
  onClick,
  isOwner = false,
  isAdmin = false,
  onDelete,
  onAdminAction,
  deleting = false,
}) {
  const image = product.imageUrls?.[0]
  const statusMeta = RESALE_STATUS[product.status] || {
    label: product.status || 'Unknown',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  }

  const isLive = product.status === 'live'
  const isPending = product.status === 'pending_review'
  const isRejected = product.status === 'rejected'

  const formattedPrice =
    product.price !== undefined && product.price !== null
      ? `₹${Number(product.price).toLocaleString('en-IN')}`
      : null

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition duration-300 hover:border-t2c-500/40 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-t2c-500/5">
      {/* Top Image Banner */}
      <div
        onClick={() => onClick?.(product._id)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <Tag className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Status Badge */}
        {(isOwner || isAdmin || !isLive) && (
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-md ${statusMeta.color}`}
            >
              {isLive && <CheckCircle2 className="h-3 w-3" />}
              {statusMeta.label}
            </span>
          </div>
        )}

        {/* Image count badge */}
        {product.imageUrls?.length > 1 && (
          <div className="absolute top-3 right-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white/90">
            📷 {product.imageUrls.length}
          </div>
        )}

        {/* AI Category Pill */}
        {product.aiAnalysis?.category && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300 backdrop-blur-md">
              <Sparkles className="h-2.5 w-2.5" />
              {product.aiAnalysis.category}
            </span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-slate-300 backdrop-blur-md">
            Stock: {product.stock ?? 1}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-wider text-t2c-400 mb-1">
              {product.brand}
            </p>
          )}

          <h3
            onClick={() => onClick?.(product._id)}
            className="font-display text-base font-semibold text-white line-clamp-1 group-hover:text-t2c-300 transition cursor-pointer"
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Pricing & Valuation Section */}
          <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-white/5 pt-3">
            <div>
              {formattedPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-lg font-bold text-white">
                    {formattedPrice}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (~{Math.round(Number(product.price) * 20)} coins)
                  </span>
                </div>
              ) : (
                <div className="text-xs font-medium text-amber-300/90 flex items-center gap-1">
                  <span>Awaiting Admin Price</span>
                </div>
              )}
            </div>

            {product.estimatedResaleCoins ? (
              <div className="flex items-center gap-1 rounded-full border border-coin-500/30 bg-coin-500/10 px-2 py-0.5 text-[11px] font-semibold text-coin-300">
                <Coins className="h-3 w-3 text-coin-400" />
                <span>~{product.estimatedResaleCoins} Est. Coins</span>
              </div>
            ) : null}
          </div>

          {/* Location / Seller Meta */}
          <div className="mt-2.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400">
            {product.location?.address ? (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                {product.location.address}
              </span>
            ) : product.location?.coordinates ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                {Number(product.location.coordinates[1]).toFixed(2)}°, {Number(product.location.coordinates[0]).toFixed(2)}°
              </span>
            ) : null}

            {isAdmin && product.seller && (
              <span className="inline-flex items-center gap-1 text-slate-300">
                👤 {product.seller.firstName || 'User'}
              </span>
            )}
          </div>

          {/* Rejection notice snippet if rejected */}
          {isRejected && product.rejectionReason && (
            <div className="mt-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-[11px] text-red-200">
              <span className="font-medium">Reason: </span>
              {product.rejectionReason}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => onClick?.(product._id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </button>

          {/* Admin Action Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onAdminAction?.(product)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600/90 hover:bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {isPending ? 'Review' : 'Manage'}
            </button>
          )}

          {/* Owner Delete Button */}
          {isOwner && (isPending || isRejected) && (
            <button
              type="button"
              onClick={() => onDelete?.(product._id)}
              disabled={deleting}
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition disabled:opacity-50"
              title="Delete Listing"
              aria-label="Delete Listing"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
