import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Plus, Recycle } from 'lucide-react'
import { getPickupHistory, deletePickup } from '../api/pickups'
import PickupCard from '../components/PickupCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function PickupHistory() {
  const location = useLocation()
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.success || '')
  const [deletingId, setDeletingId] = useState(null)

  const fetchPickups = () => {
    setLoading(true)
    getPickupHistory()
      .then((data) => setPickups(data.pickups || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPickups()
  }, [])

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleDelete = async (pickupId) => {
    setError('')
    setDeletingId(pickupId)
    try {
      await deletePickup(pickupId)
      setSuccess('Pickup cancelled successfully.')
      setPickups((prev) => prev.filter((p) => p._id !== pickupId))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const sortedPickups = [...pickups].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            All Requests
          </div>
          <h1 className="font-display text-3xl font-bold">Pickup History</h1>
          <p className="mt-2 text-slate-400">
            Track status, estimated coins, and cancel within 10 seconds of creation.
          </p>
        </div>
        <Link
          to="/schedule"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-t2c-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-t2c-500"
        >
          <Plus className="h-4 w-4" />
          New Pickup
        </Link>
      </div>

      {success && (
        <div className="mb-6">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : sortedPickups.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Recycle className="mx-auto mb-4 h-14 w-14 text-slate-600" />
          <h3 className="font-display text-xl font-semibold">No pickups yet</h3>
          <p className="mt-2 text-slate-400">Schedule your first doorstep pickup to start earning TrashCoins.</p>
          <Link
            to="/schedule"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-6 py-3 font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Schedule Pickup
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPickups.map((pickup) => (
            <PickupCard
              key={pickup._id}
              pickup={pickup}
              onDelete={handleDelete}
              deleting={deletingId === pickup._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
