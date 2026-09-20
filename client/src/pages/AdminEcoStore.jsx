import { useCallback, useEffect, useState } from 'react'
import { Plus, Store, Upload, X } from 'lucide-react'
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProductDetails,
  fetchAdminProducts,
  updateAdminProduct,
} from '../api/admin'
import ProductCard from '../components/ecoStore/ProductCard'
import ProductDetailModal from '../components/ecoStore/ProductDetailModal'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const EMPTY_FORM = {
  name: '',
  description: '',
  brand: '',
  category: '',
  subCategory: '',
  mrp: '',
  discountPercentage: '0',
  maxCoinPercent: '50',
  currency: 'INR',
  stock: '',
}

export default function AdminEcoStore({ embedded = false }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchDetails = useCallback((id) => fetchAdminProductDetails(id), [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminProducts()
      setProducts(data.allProducts || [])
    } catch (err) {
      setProducts([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const resetCreate = () => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setForm(EMPTY_FORM)
    setImages([])
    setPreviews([])
    setShowCreate(false)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    const next = [...images, ...files].slice(0, 6)
    setImages(next)
    previews.forEach((url) => URL.revokeObjectURL(url))
    setPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!images.length) {
      setError('At least one product image is required.')
      return
    }
    setSaving(true)
    try {
      await createAdminProduct(form, images)
      setSuccess('Product created successfully.')
      resetCreate()
      await loadProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleUpdate = useCallback(async (productId, fields, images) => {
    const data = await updateAdminProduct(productId, fields, images)
    setProducts((prev) => prev.map((p) => (p._id === productId ? data.product : p)))
    setSuccess('Product updated.')
    return data
  }, [])

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeletingId(pendingDelete._id)
    setError('')
    setSuccess('')
    try {
      await deleteAdminProduct(pendingDelete._id)
      setProducts((prev) => prev.filter((p) => p._id !== pendingDelete._id))
      if (selectedId === pendingDelete._id) setSelectedId(null)
      setSuccess('Product deleted.')
      setPendingDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={embedded ? '' : 'mx-auto max-w-6xl px-4 py-10 sm:px-6'}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {!embedded && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              <Store className="h-3.5 w-3.5" />
              Admin EcoStore
            </div>
          )}
          <h2 className="font-display text-xl font-semibold">EcoStore catalog</h2>
          <p className="mt-1 text-sm text-slate-400">
          Create products, edit details inline, and delete listings from each card.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError('')
            setShowCreate(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-t2c-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-t2c-500"
        >
          <Plus className="h-4 w-4" />
          Create product
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Store className="mx-auto mb-4 h-12 w-12 text-slate-600" />
          <p className="text-slate-400">No products yet. Create the first listing.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={setSelectedId}
              showAdminMeta
              onDelete={setPendingDelete}
              deleting={deletingId === product._id}
            />
          ))}
        </div>
      )}

      {selectedId && (
        <ProductDetailModal
          productId={selectedId}
          fetchDetails={fetchDetails}
          onClose={() => setSelectedId(null)}
          adminView
          onUpdate={handleUpdate}
        />
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPendingDelete(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold">Delete this product?</h3>
            <p className="mt-2 text-sm text-slate-400">
              “{pendingDelete.name}” will be removed from EcoStore. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!deletingId}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={resetCreate}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">New product</h3>
              <button type="button" onClick={resetCreate} className="rounded-lg p-2 text-slate-400 hover:bg-white/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Name</span>
                  <input required value={form.name} onChange={updateField('name')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Brand</span>
                  <input required value={form.brand} onChange={updateField('brand')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Category</span>
                  <input required value={form.category} onChange={updateField('category')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Sub-category</span>
                  <input value={form.subCategory} onChange={updateField('subCategory')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">MRP</span>
                  <input required type="number" min="0" step="1" value={form.mrp} onChange={updateField('mrp')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Stock</span>
                  <input required type="number" min="0" step="1" value={form.stock} onChange={updateField('stock')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Discount %</span>
                  <input type="number" min="0" max="100" value={form.discountPercentage} onChange={updateField('discountPercentage')} className={inputClass} />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-400">Max coin %</span>
                  <input type="number" min="0" max="100" value={form.maxCoinPercent} onChange={updateField('maxCoinPercent')} className={inputClass} />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block text-slate-400">Description</span>
                <textarea required rows={3} value={form.description} onChange={updateField('description')} className={inputClass} />
              </label>

              <div>
                <span className="mb-1.5 block text-sm text-slate-400">Images (up to 6)</span>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:border-t2c-500/40">
                  <Upload className="h-4 w-4" />
                  Upload photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
                {previews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {previews.map((src, i) => (
                      <div key={src} className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute right-1 top-1 rounded bg-black/70 p-0.5 text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetCreate} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-t2c-600 px-4 py-2 text-sm font-semibold text-white hover:bg-t2c-500 disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500'
