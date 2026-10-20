import { useState } from 'react'
import { X, Upload, MapPin, Sparkles, AlertCircle, ImagePlus, Loader2, CheckCircle2 } from 'lucide-react'
import { createResaleProduct } from '../../api/resale'
import Alert from '../Alert'

export default function UploadResaleModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    stock: '1',
    description: '',
    address: '',
    lat: '',
    lng: '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFieldChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Cap at 4 images total
    const total = [...images, ...files].slice(0, 4)
    setImages(total)

    // Rebuild previews
    previews.forEach((url) => URL.revokeObjectURL(url))
    setPreviews(total.map((f) => URL.createObjectURL(f)))
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setGettingLocation(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }))
        setGettingLocation(false)
        setLocationSuccess(true)
      },
      (err) => {
        setGettingLocation(false)
        setError(`Unable to retrieve location: ${err.message}. Please enter coordinates manually.`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Please provide a product name.')
      return
    }

    if (!images.length) {
      setError('Please upload at least 1 image of the item.')
      return
    }

    if (form.lat === '' || form.lng === '') {
      setError('Product location (latitude & longitude) is required. Click "Use Current Location" or enter them.')
      return
    }

    setSubmitting(true)
    try {
      const data = await createResaleProduct(form, images)
      previews.forEach((url) => URL.revokeObjectURL(url))
      onSuccess(data.resaleProduct || data.message || 'Product submitted successfully!')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-t2c-500/30 bg-t2c-500/10 px-3 py-1 text-xs font-medium text-t2c-300 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Resale
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Sell a Pre-Loved Item</h2>
            <p className="mt-1 text-sm text-slate-400">
              Upload photos and details. Our AI evaluates fair market value, and our admin activates it live on the store.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Photos Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Item Photos <span className="text-red-400">*</span>{' '}
              <span className="text-xs text-slate-400 font-normal">(1 to 4 clear photos)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previews.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-950 group"
                >
                  <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 rounded-lg bg-black/70 p-1.5 text-white/80 hover:bg-red-500 hover:text-white transition"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-t2c-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {previews.length < 4 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-4 text-center transition hover:border-t2c-500/50 hover:bg-t2c-500/5">
                  <ImagePlus className="h-8 w-8 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-300">Add Photo</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{previews.length}/4 selected</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name & Brand */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleFieldChange('name')}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={handleFieldChange('brand')}
                placeholder="e.g. IKEA, Nilkamal, Sony"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              />
            </div>
          </div>

          {/* Stock & Optional Description */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Quantity / Stock
              </label>
              <input
                type="number"
                min="1"
                value={form.stock}
                onChange={handleFieldChange('stock')}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Condition & Description <span className="text-xs text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={handleFieldChange('description')}
                placeholder="e.g. Lightly used for 6 months, no scratches, working perfectly"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              />
            </div>
          </div>

          {/* Location coordinates */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-t2c-400" />
                  Item Location <span className="text-red-400">*</span>
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Required for local pickup & verification
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-2 rounded-xl bg-t2c-500/15 border border-t2c-500/30 px-3 py-1.5 text-xs font-semibold text-t2c-300 hover:bg-t2c-500/25 transition disabled:opacity-50"
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Detecting GPS...
                  </>
                ) : locationSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    GPS Acquired
                  </>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5" />
                    Use Current GPS
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Longitude (lng)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={form.lng}
                  onChange={handleFieldChange('lng')}
                  placeholder="e.g. 77.2090"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-t2c-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Latitude (lat)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={form.lat}
                  onChange={handleFieldChange('lat')}
                  placeholder="e.g. 28.6139"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-t2c-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Address / Landmark (Optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={handleFieldChange('address')}
                placeholder="e.g. Green Park, Sector 4, New Delhi"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-t2c-500 focus:outline-none"
              />
            </div>
          </div>

          {/* AI Banner info */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Review Process:</strong> Once uploaded, our Gemini AI evaluates the category and estimates TrashCoin reward. Our admin will verify and activate your item live in the store so other users and inspectors can discover it!
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-t2c-500/20 hover:from-t2c-400 hover:to-emerald-500 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing & Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
