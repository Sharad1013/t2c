import { useEffect, useState } from 'react'
import { Coins, Package, Plus, Star, X } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import Alert from '../Alert'
import { formatInr } from '../../utils/formatters'

export default function ProductDetailModal({
  productId,
  fetchDetails,
  onClose,
  adminView = false,
  onUpdate,
}) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setProduct(null)
    setActiveImage(0)

    fetchDetails(productId)
      .then((data) => {
        if (cancelled) return
        setProduct(data.foundProduct)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId, fetchDetails])

  const saveFields = async (fields, images = []) => {
    if (!onUpdate || !product) return
    setSaving(true)
    setError('')
    try {
      const data = await onUpdate(product._id, fields, images)
      const next = data.product
      if (next) {
        setProduct(next)
        setActiveImage(0)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const saveField = (key, value) => {
    if (!product) return
    if (String(product[key] ?? '') === String(value)) return
    saveFields({ [key]: value })
  }

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    saveFields({}, files)
  }

  const discounted = product?.discountedPrice ?? product?.mrp
  const hasDiscount = Number(product?.discountPercentage) > 0
  const maxCoins = Math.round((discounted || 0) * (Number(product?.maxCoinPercent) || 0) / 100)
  const images = product?.imageUrls || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg border border-white/10 bg-slate-950/80 p-2 text-slate-300 hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !product && error ? (
          <div className="p-8">
            <Alert type="error" message={error} />
          </div>
        ) : product ? (
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-slate-900 p-5">
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-800">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                      i === activeImage ? 'border-t2c-400' : 'border-white/10'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                {adminView && (
                  <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-t2c-500/40 bg-t2c-500/10 text-t2c-300 hover:bg-t2c-500/20">
                    <Plus className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAddImages}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
              )}
              {adminView && saving && (
                <p className="mb-3 text-xs text-slate-500">Saving…</p>
              )}

              {adminView ? (
                <AdminEditableFields product={product} onSaveField={saveField} discounted={discounted} />
              ) : (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-t2c-400">
                    {product.brand}
                    {product.category ? ` · ${product.category}` : ''}
                    {product.subCategory ? ` · ${product.subCategory}` : ''}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold">{product.name}</h2>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 text-coin-400" />
                      {Number(product.ratingAvg || 0).toFixed(1)}
                      <span className="text-slate-500">({product.ratingCount || 0})</span>
                    </span>
                    <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold">
                        {formatInr(discounted, product.currency)}
                      </span>
                      {hasDiscount && (
                        <span className="text-slate-500 line-through">
                          {formatInr(product.mrp, product.currency)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="mt-1 text-sm text-t2c-400">{product.discountPercentage}% off MRP</p>
                    )}
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-coin-400">
                      <Coins className="h-4 w-4" />
                      Redeem up to {maxCoins} TrashCoins ({product.maxCoinPercent}% of price)
                    </p>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-slate-300">{product.description}</p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AdminEditableFields({ product, onSaveField, discounted }) {
  return (
    <div className="space-y-4 pr-8">
      <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wider text-t2c-400">
        <InlineField value={product.brand} onCommit={(v) => onSaveField('brand', v)} className={metaInputClass} />
        <span className="text-slate-600">·</span>
        <InlineField value={product.category} onCommit={(v) => onSaveField('category', v)} className={metaInputClass} />
        <span className="text-slate-600">·</span>
        <InlineField
          value={product.subCategory || ''}
          onCommit={(v) => onSaveField('subCategory', v)}
          placeholder="sub-category"
          className={metaInputClass}
        />
      </div>

      <InlineField
        value={product.name}
        onCommit={(v) => onSaveField('name', v)}
        className="w-full bg-transparent font-display text-2xl font-bold text-white outline-none"
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Star className="h-4 w-4 text-coin-400" />
          <InlineField
            value={String(product.ratingAvg ?? 0)}
            onCommit={(v) => onSaveField('ratingAvg', v)}
            className="w-12 bg-transparent outline-none"
          />
          <span className="text-slate-500">(</span>
          <InlineField
            value={String(product.ratingCount ?? 0)}
            onCommit={(v) => onSaveField('ratingCount', v)}
            className="w-10 bg-transparent outline-none"
          />
          <span className="text-slate-500">)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <InlineField
            value={String(product.stock ?? 0)}
            onCommit={(v) => onSaveField('stock', v)}
            className="w-14 bg-transparent outline-none"
          />
          in stock
        </span>
        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={!!product.isActive}
            onChange={(e) => onSaveField('isActive', e.target.checked)}
            className="rounded border-white/20 bg-white/5"
          />
          Active
        </label>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-white">
            {formatInr(discounted, product.currency)}
          </span>
          <span className="text-sm text-slate-500">sale price</span>
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <label className="flex items-center gap-2">
            MRP
            <InlineField
              value={String(product.mrp ?? 0)}
              onCommit={(v) => onSaveField('mrp', v)}
              className="min-w-0 flex-1 border-b border-white/20 bg-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            Discount %
            <InlineField
              value={String(product.discountPercentage ?? 0)}
              onCommit={(v) => onSaveField('discountPercentage', v)}
              className="min-w-0 flex-1 border-b border-white/20 bg-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            Coin %
            <InlineField
              value={String(product.maxCoinPercent ?? 0)}
              onCommit={(v) => onSaveField('maxCoinPercent', v)}
              className="min-w-0 flex-1 border-b border-white/20 bg-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            Currency
            <InlineField
              value={product.currency || 'INR'}
              onCommit={(v) => onSaveField('currency', v)}
              className="min-w-0 flex-1 border-b border-white/20 bg-transparent outline-none"
            />
          </label>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-coin-400">
          <Coins className="h-4 w-4" />
          Redeem up to {Math.round((discounted || 0) * (Number(product.maxCoinPercent) || 0) / 100)} TrashCoins
        </p>
      </div>

      <InlineField
        multiline
        value={product.description || ''}
        onCommit={(v) => onSaveField('description', v)}
        className="w-full resize-y bg-transparent text-sm leading-relaxed text-slate-300 outline-none"
      />
    </div>
  )
}

function InlineField({ value, onCommit, className, multiline = false, placeholder }) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  const commit = () => {
    if (String(local) === String(value)) return
    onCommit(local)
  }

  const shared = {
    value: local,
    placeholder,
    onChange: (e) => setLocal(e.target.value),
    onBlur: commit,
    onKeyDown: (e) => {
      if (!multiline && e.key === 'Enter') {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    className,
  }

  if (multiline) {
    return <textarea rows={4} {...shared} />
  }
  return <input type="text" {...shared} />
}

const metaInputClass =
  'min-w-[4rem] max-w-[10rem] bg-transparent uppercase tracking-wider outline-none'
