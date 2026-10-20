import { useEffect, useState, useCallback } from 'react'
import {
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Tag,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchLiveResaleProducts, fetchMyResaleProducts, deleteResaleProduct } from '../api/resale'
import ResaleProductCard from '../components/resaleStore/ResaleProductCard'
import ResaleProductDetailModal from '../components/resaleStore/ResaleProductDetailModal'
import UploadResaleModal from '../components/resaleStore/UploadResaleModal'
import AdminResaleManagement from '../components/resaleStore/AdminResaleManagement'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Clothing', 'Appliances', 'Books', 'Toys', 'Other']

export default function ResaleStore() {
  const { user, isAdmin } = useAuth()

  const [activeTab, setActiveTab] = useState('browse') // 'browse' | 'my-resales' | 'admin'
  const [liveProducts, setLiveProducts] = useState([])
  const [myProducts, setMyProducts] = useState([])

  const [loadingLive, setLoadingLive] = useState(true)
  const [loadingMine, setLoadingMine] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Fetch live products for store
  const loadLiveProducts = useCallback(async () => {
    setLoadingLive(true)
    setError('')
    try {
      const data = await fetchLiveResaleProducts()
      setLiveProducts(data.products || data.allResaleProducts || [])
    } catch (err) {
      setLiveProducts([])
      setError(err.message)
    } finally {
      setLoadingLive(false)
    }
  }, [])

  // Fetch user's own resales
  const loadMyProducts = useCallback(async () => {
    setLoadingMine(true)
    setError('')
    try {
      const data = await fetchMyResaleProducts()
      setMyProducts(data.allResaleProducts || [])
    } catch (err) {
      setMyProducts([])
      // Don't show critical error if just empty
      if (!err.message?.toLowerCase().includes('no resale product')) {
        setError(err.message)
      }
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    loadLiveProducts()
  }, [loadLiveProducts])

  useEffect(() => {
    if (activeTab === 'my-resales') {
      loadMyProducts()
    }
  }, [activeTab, loadMyProducts])

  const handleUploadSuccess = (newProduct) => {
    setSuccess('Item submitted successfully! Our AI analyzed it and sent it for Admin review.')
    // Refresh my products
    loadMyProducts()
    // Switch to my resales tab to see status
    setActiveTab('my-resales')
  }

  const handleProductDeleted = (deletedId) => {
    setMyProducts((prev) => prev.filter((p) => p._id !== deletedId))
    setLiveProducts((prev) => prev.filter((p) => p._id !== deletedId))
    setSuccess('Listing removed successfully.')
  }

  // Filter live products
  const filteredLiveProducts = liveProducts.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' ||
      p.aiAnalysis?.category?.toLowerCase() === category.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-t2c-500/30 bg-t2c-500/10 px-3 py-1 text-xs font-semibold text-t2c-300">
              <Sparkles className="h-3.5 w-3.5 text-t2c-400" />
              Circular Marketplace · Verified Listings
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Second-Hand <span className="gradient-text">Resale Store</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Give pre-loved items a new home. Any user can list an item — our Gemini AI valuations
              and admin quality reviews ensure every listing is trustworthy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-t2c-500/25 transition hover:from-t2c-400 hover:to-emerald-500 hover:scale-[1.02]"
            >
              <PlusCircle className="h-5 w-5" />
              Sell an Item
            </button>
          </div>
        </div>

        {/* Decorative backdrop light */}
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-t2c-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Global Alerts */}
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

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'browse'
                ? 'bg-t2c-500/20 text-t2c-300 border border-t2c-500/30 shadow-md shadow-t2c-500/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Live Store
            <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {liveProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-resales')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'my-resales'
                ? 'bg-t2c-500/20 text-t2c-300 border border-t2c-500/30 shadow-md shadow-t2c-500/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Tag className="h-4 w-4" />
            My Resale Listings
            {myProducts.length > 0 && (
              <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {myProducts.length}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-md shadow-violet-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Review Panel
            </button>
          )}
        </div>

        {activeTab === 'browse' && (
          <button
            type="button"
            onClick={loadLiveProducts}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        )}
      </div>

      {/* Tab Content 1: Browse Store */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters and Search Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      category === cat
                        ? 'bg-t2c-500 text-white shadow-md shadow-t2c-500/20'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search live items..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-t2c-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loadingLive ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredLiveProducts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <h3 className="font-display text-lg font-semibold text-white">No Live Resale Products Yet</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                Items appear here once approved and marked active by our admin team. Have an item you no longer need?
              </p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-t2c-600 px-4 py-2 text-xs font-semibold text-white hover:bg-t2c-500 transition"
              >
                <PlusCircle className="h-4 w-4" />
                List Your Item Now
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLiveProducts.map((product) => (
                <ResaleProductCard
                  key={product._id}
                  product={product}
                  onClick={setSelectedDetailId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: My Resale Listings */}
      {activeTab === 'my-resales' && (
        <div>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-white">My Resale Listings</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track all products you have submitted. Items must be approved and marked active by an admin before appearing on the public store.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-t2c-600 hover:bg-t2c-500 px-4 py-2 text-xs font-semibold text-white transition shadow-sm shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
              List Another Item
            </button>
          </div>

          {loadingMine ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : myProducts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <h3 className="font-display text-lg font-semibold text-white">
                You haven't listed any items for resale
              </h3>
              <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                Earn TrashCoins and keep reusable goods out of landfills. Upload photos and details to get started.
              </p>
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-t2c-600 px-4 py-2 text-xs font-semibold text-white hover:bg-t2c-500 transition"
              >
                <PlusCircle className="h-4 w-4" />
                List an Item
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myProducts.map((product) => (
                <ResaleProductCard
                  key={product._id}
                  product={product}
                  isOwner={true}
                  onClick={setSelectedDetailId}
                  onDelete={async (id) => {
                    if (!window.confirm('Delete this listing?')) return
                    try {
                      await deleteResaleProduct(id)
                      handleProductDeleted(id)
                    } catch (err) {
                      setError(err.message)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Admin Review Panel */}
      {activeTab === 'admin' && isAdmin && (
        <AdminResaleManagement embedded={true} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResaleModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Product Detail Modal */}
      {selectedDetailId && (
        <ResaleProductDetailModal
          productId={selectedDetailId}
          currentUserId={user?._id || user?.id}
          isAdmin={isAdmin}
          onClose={() => setSelectedDetailId(null)}
          onProductDeleted={handleProductDeleted}
        />
      )}
    </div>
  )
}
