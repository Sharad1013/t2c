import { useCallback, useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import { getAllProducts, getProductDetails, purchaseProduct } from '../api/products'
import ProductCard from '../components/ecoStore/ProductCard'
import ProductDetailModal from '../components/ecoStore/ProductDetailModal'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function EcoStore() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [buyingId, setBuyingId] = useState(null)

  const fetchDetails = useCallback((id) => getProductDetails(id), [])

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data.allProducts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleBuy = async (product, quantity) => {
    setError('')
    setSuccess('')
    setBuyingId(product._id)
    try {
      const data = await purchaseProduct(product._id, quantity)
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, stock: data.remainingStock ?? Math.max(0, (p.stock || 0) - quantity) }
            : p
        )
      )
      setSuccess(data.message || `Purchased ${quantity} × ${product.name}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBuyingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-t2c-500/30 bg-t2c-500/10 px-3 py-1 text-xs font-medium text-t2c-300">
          <Store className="h-3.5 w-3.5" />
          EcoStore
        </div>
        <h1 className="font-display text-3xl font-bold">Shop with TrashCoins</h1>
        <p className="mt-2 text-slate-400">
          Browse eco-friendly products and buy with a tap. Set quantity, then hit Buy Now.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Store className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">No products listed yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={setSelectedId}
              showPurchase
              onBuy={handleBuy}
              buying={buyingId === product._id}
            />
          ))}
        </div>
      )}

      {selectedId && (
        <ProductDetailModal
          productId={selectedId}
          fetchDetails={fetchDetails}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
