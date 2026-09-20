import { useEffect, useState } from 'react'
import { Coins, Minus, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatInr } from '../../utils/formatters'

const COINS_PER_RUPEE = 20

export default function ProductCard({
  product,
  onClick,
  showAdminMeta = false,
  onDelete,
  deleting = false,
  showPurchase = false,
  onBuy,
  buying = false,
}) {

  const image = product.imageUrls?.[0]
  const discounted = product.discountedPrice ?? product.mrp
  const hasDiscount = Number(product.discountPercentage) > 0
  const maxCoins = Math.round((discounted || 0) * (Number(product.maxCoinPercent) || 0) / 100)
  const stock = Number(product.stock) || 0
  
  const [quantity, setQuantity] = useState(stock > 0 ? 1 : 0)
  const [showConfirm, setShowConfirm] = useState(false)

  const totalPrice = discounted * quantity
  const coinsToSpend = Math.ceil(totalPrice * (Number(product.maxCoinPercent) || 0) / 100)
  const cashToPay = Math.round((totalPrice - coinsToSpend) * 100) / 100





  useEffect(() => {
    setQuantity((prev) => {
      if (stock <= 0) return 0
      if (prev < 1) return 1
      return Math.min(prev, stock)
    })
  }, [stock])

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-t2c-500/40 hover:bg-white/[0.07]">
      <button
        type="button"
        onClick={() => onClick(product._id)}
        className="flex flex-1 flex-col text-left"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              <Package className="h-10 w-10" />
            </div>
          )}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-t2c-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {product.discountPercentage}% off
            </span>
          )}
          {showAdminMeta && (
            <span
              className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-medium ${product.isActive
                ? 'border-t2c-500/40 bg-t2c-500/20 text-t2c-300'
                : 'border-slate-500/40 bg-slate-800/80 text-slate-300'
                }`}
            >
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 pb-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {product.brand}
            {product.category ? ` · ${product.category}` : ''}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-white">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{product.description}</p>

          <div className="mt-auto pt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-white">
                {formatInr(discounted, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-500 line-through">
                  {formatInr(product.mrp, product.currency)}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-coin-400">
                <Coins className="h-3.5 w-3.5" />
                Up to {maxCoins} coins
              </span>
              <span>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
            </div>
          </div>
        </div>
      </button>

      {showPurchase && (
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
            <button
              type="button"
              disabled={quantity <= 1 || buying}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-l-xl p-2 text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              disabled={quantity >= stock || buying || stock <= 0}
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="rounded-r-xl p-2 text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={buying || stock <= 0 || quantity < 1}
            onClick={() => setShowConfirm(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-t2c-600 px-3 py-2 text-sm font-semibold text-white hover:bg-t2c-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      )}

      {onDelete && (
        <div className="border-t border-white/10 px-4 py-3">
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(product)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete product'}
          </button>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !buying && setShowConfirm(false)}   // click backdrop to close
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}             // don't close when clicking inside
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-display text-lg font-semibold text-white">Confirm purchase</h3>
              <button
                type="button"
                disabled={buying}
                onClick={() => setShowConfirm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-medium text-white">{product.name}</p>

            {/* quantity — editable here too */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">Quantity</span>
              <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  disabled={quantity <= 1 || buying}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-l-xl p-2 text-slate-300 hover:bg-white/10 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= stock || buying}
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  className="rounded-r-xl p-2 text-slate-300 hover:bg-white/10 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* breakdown */}
            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Total price</span>
                <span className="text-white">{formatInr(totalPrice, product.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="inline-flex items-center gap-1 text-coin-400">
                  <Coins className="h-3.5 w-3.5" /> Coins used
                </span>
                <span className="text-coin-400">{coinsToSpend} coins</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-semibold">
                <span className="text-slate-300">Cash to pay</span>
                <span className="text-white">{formatInr(cashToPay, product.currency)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={buying}
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={buying || stock <= 0 || quantity < 1}
                onClick={() => onBuy?.(product, quantity)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-t2c-600 px-4 py-2 text-sm font-semibold text-white hover:bg-t2c-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {buying ? 'Buying…' : 'Confirm purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
