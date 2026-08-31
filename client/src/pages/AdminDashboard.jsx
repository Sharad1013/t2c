import { useCallback, useEffect, useState } from 'react'
import { Shield, Truck, Users, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  fetchAllInspectors,
  fetchInspectorsAsPerStatus,
  approveRejectPendingInspectors,
  fetchAllUsers,
  fetchAllPickups,
  fetchPickupsAsPerStatus
} from '../api/admin'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/LoadingSpinner'
import { INSPECTOR_STATUS, VEHICLE_TYPES } from '../utils/constants'
import { INDIAN_STATES } from '../utils/constants'

const SECTIONS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'inspectors', label: 'Inspectors', icon: Truck },
  { id: 'pickups', label: 'Pickups', icon: Package },
]

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
]

const STATUS_UPDATE_OPTIONS = ['under_review', 'approved', 'rejected', 'suspended']

const PICKUP_STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'picked_up', label: 'Picked Up' },
  { id: 'cancelled', label: 'Cancelled' },
]

// build once from your existing states constant, with an "All" option prepended
const STATE_FILTERS = [{ id: 'all', label: 'All' }, ...INDIAN_STATES.map((s) => ({ id: s, label: s }))]


function vehicleLabel(type) {
  return VEHICLE_TYPES.find((v) => v.id === type)?.label || type || '—'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [section, setSection] = useState('inspectors')
  const [inspectors, setInspectors] = useState([])
  const [users, setUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  const [pickups, setPickups] = useState([])
  const [pickupStatus, setPickupStatus] = useState('all')
  const [pickupState, setPickupState] = useState('all')


  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadInspectors = useCallback(async (filter) => {
    setLoading(true)
    setError('')
    try {
      const data =
        filter === 'all'
          ? await fetchAllInspectors()
          : await fetchInspectorsAsPerStatus(filter)
      setInspectors(data.inspectors || [])
    } catch (err) {
      setInspectors([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAllUsers()
      setUsers(data.users || [])
    } catch (err) {
      setUsers([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPickups = useCallback(async (status, state) => {
    setLoading(true)
    setError('')
    try {
      const data =
        status === 'all' && state === 'all'
          ? await fetchAllPickups()
          : await fetchPickupsAsPerStatus(
            status === 'all' ? undefined : status,
            state === 'all' ? undefined : state,
          )
      setPickups(data.pickups || [])
    } catch (err) {
      setPickups([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (section !== 'inspectors') return
    loadInspectors(statusFilter)
  }, [section, statusFilter, loadInspectors])

  useEffect(() => {
    if (section !== 'users') return
    loadUsers()
  }, [section, loadUsers])

  useEffect(() => {
    if (section !== 'pickups') return
    loadPickups(pickupStatus, pickupState)
  }, [section, pickupStatus, pickupState, loadPickups])


  const handleStatusChange = async (inspectorId, nextStatus, currentStatus) => {
    if (!nextStatus || nextStatus === currentStatus) return
    setUpdatingId(inspectorId)
    setError('')
    setSuccess('')
    try {
      const data = await approveRejectPendingInspectors(inspectorId, nextStatus)
      setSuccess(data.message || `Status updated to ${nextStatus}.`)
      await loadInspectors(statusFilter)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
          <Shield className="h-3.5 w-3.5" />
          Admin
        </div>
        <h1 className="font-display text-3xl font-bold">
          Hi, {user?.firstName}! 👋
        </h1>
        <p className="mt-2 text-slate-400">
          Platform overview — manage users, inspectors, and pickups.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${active
                ? 'border-t2c-500/40 bg-t2c-500/20 text-t2c-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {section === 'users' && (
        <div>
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold">Users</h2>
            <p className="mt-1 text-sm text-slate-400">All registered platform users.</p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">No users found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">State</th>
                      <th className="px-4 py-3 font-medium">Pincode</th>
                      <th className="px-4 py-3 font-medium">Coins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u._id} className="bg-slate-950/40 hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">
                            {u.firstName} {u.lastName}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-slate-400">{u?.address?.state}</td>
                        <td className="px-4 py-3 text-slate-400">{u?.address?.pincode}</td>
                        <td className="px-4 py-3 text-slate-400">{u?.trashCoins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {section === 'pickups' && (
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Pickups</h2>
              <p className="mt-1 text-sm text-slate-400">Filter pickups by status and state.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <select
                value={pickupStatus}
                onChange={(e) => setPickupStatus(e.target.value)}
                className="min-w-[9rem] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              >
                {PICKUP_STATUS_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <select
                value={pickupState}
                onChange={(e) => setPickupState(e.target.value)}
                className="min-w-[9rem] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              >
                {STATE_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : pickups.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">No pickups found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Pickup</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">State</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pickups.map((p) => (
                      <tr key={p._id} className="bg-slate-950/40 hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{p._id}</td>
                        <td className="px-4 py-3 text-slate-300">
                          <p>{p.address?.city || '—'}</p>
                          <p className="text-xs text-slate-500">{p.address?.pincode || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{p.address?.state || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                            {p.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {section === 'inspectors' && (
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Inspectors</h2>
              <p className="mt-1 text-sm text-slate-400">
                Review applications and update inspector status.
              </p>
            </div>
            <div className="sm:max-w-xs sm:self-start">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[10rem] rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
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
          ) : inspectors.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Truck className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <p className="text-slate-400">
                {statusFilter === 'all'
                  ? 'No inspectors found.'
                  : `No inspectors with status “${STATUS_FILTERS.find((f) => f.id === statusFilter)?.label}”.`}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Inspector</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Vehicle</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inspectors.map((inspector) => {
                      const statusMeta = INSPECTOR_STATUS[inspector.status] || INSPECTOR_STATUS.pending
                      const selectValue = STATUS_UPDATE_OPTIONS.includes(inspector.status)
                        ? inspector.status
                        : ''
                      return (
                        <tr key={inspector._id} className="bg-slate-950/40 hover:bg-white/[0.03]">
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{inspector.fullName}</p>
                            <p className="text-xs capitalize text-slate-500">{inspector.role}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            <p>{inspector.email}</p>
                            <p className="text-xs text-slate-500">{inspector.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            <p>{inspector.address?.city || '—'}</p>
                            <p className="text-xs text-slate-500">{inspector.address?.pincode || ''}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {vehicleLabel(inspector.vehicle?.type)}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {formatDate(inspector.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusMeta.color}`}
                            >
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={selectValue}
                              disabled={updatingId === inspector._id}
                              onChange={(e) =>
                                handleStatusChange(inspector._id, e.target.value, inspector.status)
                              }
                              className="w-full min-w-[9.5rem] rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-200 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500 disabled:opacity-50"
                            >
                              <option value="" disabled>
                                Update status
                              </option>
                              {STATUS_UPDATE_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {INSPECTOR_STATUS[status].label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-slate-400">This section is coming soon.</p>
    </div>
  )
}
