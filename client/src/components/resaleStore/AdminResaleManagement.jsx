import { useCallback, useEffect, useState } from 'react'
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tag,
  RefreshCw,
  Eye,
  Trash2,
} from 'lucide-react'
import { fetchAdminResaleProducts, deleteAdminResaleProduct } from '../../api/admin'
import ResaleProductCard from './ResaleProductCard'
import ResaleProductDetailModal from './ResaleProductDetailModal'
import AdminResaleModal from './AdminResaleModal'
import LoadingSpinner from '../LoadingSpinner'
import Alert from '../Alert'

const RESALE_ADMIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending_review', label: 'Pending Review' },
  { id: 'live', label: 'Live in Store' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'sold', label: 'Sold' },
  { id: 'expired', label: 'Expired' },
]

export default function AdminResaleManagement({ embedded = false }) {
  const [products, setProducts] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [selectedDetailId, setSelectedDetailId] = useState(null)
  const [adminActionProduct, setAdminActionProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadProducts = useCallback(async (filter) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminResaleProducts(filter)
      setProducts(data.resaleProducts || [])
    } catch (err) {
      setProducts([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts(statusFilter)
  }, [loadProducts, statusFilter])

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    )
    setSuccess(`Listing updated successfully.`)
  }

  const handleProductDeleted = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p._id !== deletedId))
    setSuccess(`Listing deleted.`)
  }

  // Filtered by search text
  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const nameMatch = p.name?.toLowerCase().includes(q)
    const brandMatch = p.brand?.toLowerCase().includes(q)
    const sellerMatch =
      p.seller?.firstName?.toLowerCase().includes(q) ||
      p.seller?.lastName?.toLowerCase().includes(q) ||
      p.seller?.email?.toLowerCase().includes(q)
    return nameMatch || brandMatch || sellerMatch
  })

  const pendingCount = products.filter((p) => p.status === 'pending_review').length

  return (
    <div className={embedded ? '' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6'}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {!embedded && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Resale Store Admin
            </div>
          )}
          <h2 className="font-display text-2xl font-bold text-white">
            Resale Listings Management
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Review user submissions, set store pricing, and publish active products live to the marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadProducts(statusFilter)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
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

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {RESALE_ADMIN_FILTERS.map((f) => {
            const isActive = statusFilter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`relative rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
                {f.id === 'pending_review' && pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item, brand, seller..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <Tag className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-slate-300 font-medium">No resale products found</p>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter !== 'all'
              ? `No products matching status "${statusFilter}". Try changing filters.`
              : 'Users have not uploaded any resale items yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <ResaleProductCard
              key={p._id}
              product={p}
              isAdmin={true}
              onClick={setSelectedDetailId}
              onAdminAction={setAdminActionProduct}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetailId && (
        <ResaleProductDetailModal
          productId={selectedDetailId}
          isAdmin={true}
          onClose={() => setSelectedDetailId(null)}
          onAdminAction={(prod) => {
            setSelectedDetailId(null)
            setAdminActionProduct(prod)
          }}
          onProductDeleted={handleProductDeleted}
        />
      )}

      {/* Admin Action Review Modal */}
      {adminActionProduct && (
        <AdminResaleModal
          product={adminActionProduct}
          onClose={() => setAdminActionProduct(null)}
          onUpdated={handleProductUpdated}
          onDeleted={handleProductDeleted}
        />
      )}
    </div>
  )
}
