import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { toggleInspectorAvailability } from '../api/inspector'
import { getNotifications } from '../api/notifications'
import { updatePickupStatus, verifyPickupOtp, getPickupsPerInspector, updatePickupStatusToDelivered } from '../api/pickups'
import Alert from '../components/Alert'
import {
  Bell,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
  XCircle,
  Check,
  Trash2,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { INSPECTOR_STATUS } from '../utils/constants'

const statusMessages = {
  pending: 'Your application is submitted and awaiting review. You will be notified once approved.',
  under_review: 'Our team is verifying your KYC documents. This usually takes 1–2 business days.',
  approved: 'You are approved! Toggle availability to start receiving nearby pickup requests.',
  rejected: 'Your application was not approved. Please contact support for more details.',
  suspended: 'Your account is temporarily suspended. Contact support to resolve this.',
}


export default function InspectorDashboard() {
  const { user: inspector, updateLocalUser } = useAuth()
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [recentPickups, setRecentPickups] = useState([])
  const [loadingPickups, setLoadingPickups] = useState(true)


  const [currentPickup, setCurrentPickup] = useState(null)
  const [currentOngoingPickup, setCurrentOngoingPickup] = useState(null)
  const [pickupHistory, setPickupHistory] = useState([])
  const [showOtpEntry, setShowOtpEntry] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState('')
  const [verifying, setVerifying] = useState(false)


  const [showDeliverModal, setShowDeliverModal] = useState(false)
  const [deliverFiles, setDeliverFiles] = useState([])
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [deliverVerdict, setDeliverVerdict] = useState(null)
  const [delivered, setDelivered] = useState(false)

  const status = inspector?.status || 'pending'
  const statusMeta = INSPECTOR_STATUS[status] || INSPECTOR_STATUS.pending
  const stats = inspector?.stats || {}
  const isApproved = status === 'approved'

  const handleToggleAvailability = async () => {
    if (!isApproved || toggling) return

    setToggleError('')
    setToggling(true)

    try {
      const data = await toggleInspectorAvailability()
      updateLocalUser(data.inspector)
    } catch (err) {
      setToggleError(err.message)
    } finally {
      setToggling(false)
    }
  }

  const loadInspectorPickups = useCallback(async () => {
    if (!inspector?._id) return
    try {
      const data = await getPickupsPerInspector(inspector._id)
      setCurrentPickup(data.currentAssignedPickups?.[0] || null)   // one at a time → [0]
      setCurrentOngoingPickup(data?.currentPickedUpPickups?.[0] || null)
      setPickupHistory(data.otherPickups || [])
    } catch (err) {
      console.error('Failed to load inspector pickups', err)
    }
  }, [inspector?._id])

  useEffect(() => {
    async function loadRecentPickups() {
      if (!isApproved) {
        setLoadingPickups(false)
        return
      }
      try {
        const data = await getNotifications({ unreadOnly: true })
        if (data.success && data.items) {
          // Filter notifications that have a populated pickup and take top 3
          const pickups = data.items
            .filter((n) => n.pickup)
            .slice(0, 3)
          setRecentPickups(pickups)
        }
      } catch (error) {
        console.error('Failed to load recent pickups', error)
      } finally {
        setLoadingPickups(false)
      }
    }
    loadRecentPickups()
  }, [isApproved])

  useEffect(() => {
    if (!isApproved) return
    loadInspectorPickups()
  }, [isApproved, loadInspectorPickups])

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6 || verifying) return
    console.log("otpvalue", otpValue);
    setOtpError('')
    setVerifying(true)
    try {
      await verifyPickupOtp(currentPickup._id, otpValue)
      setDashboardMessage('Pickup confirmed as picked up! 🎉')
      setCurrentPickup(null)
      setShowOtpEntry(false)
      setOtpValue('')
      await loadInspectorPickups()          // <-- was setCurrentPickup(null)
      setTimeout(() => setDashboardMessage(''), 5000)
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  const handleAcceptPickup = async (item) => {
    if (!inspector?._id) return
    if (currentPickup) {
      setToggleError('You already have an active pickup. Complete it first.')
      return
    }
    const pickupId = item.pickup?._id
    try {
      await updatePickupStatus(pickupId, inspector?._id)          // pending -> assigned
      setRecentPickups((prev) => prev.filter((p) => p.pickup?._id !== pickupId))
      setCurrentPickup(item.pickup)               // show it as the active pickup
      setShowOtpEntry(false)
      setOtpValue('')
      setDashboardMessage('Pickup assigned! Collect the waste, then enter the user OTP to confirm.')
      setTimeout(() => setDashboardMessage(''), 5000)
    } catch (err) {
      setToggleError(err.message)
    }
  }

  const handleRemovePickupView = (notificationId) => {
    setRecentPickups((prev) => prev.filter((n) => n._id !== notificationId))
  }

  // const handleDeliverSubmit = async () => {
  //   if (!deliverFiles.length || delivering) return
  //   setDelivering(true)
  //   setDeliverError('')
  //   setDeliverVerdict(null)
  //   try {
  //     const data = await updatePickupStatusToDelivered(
  //       currentOngoingPickup._id,
  //       inspector._id,
  //       deliverFiles,
  //     )
  //     if (data.success) {
  //       setDelivered(true)                 // triggers the success animation
  //       await loadInspectorPickups()       // pickup leaves "ongoing", moves to history
  //     } else {
  //       // backend returns 422 with verdict on mismatch — axios throws, so this branch
  //       // rarely hits; the catch below handles it. Kept for non-throwing setups.
  //       setDeliverVerdict(data.verdict)
  //       setDeliverError(data.message)
  //     }
  //   } catch (err) {
  //     // mismatch (422) lands here — surface the verdict so they can retry
  //     setDeliverVerdict(err.response?.data?.verdict || null)
  //     setDeliverError(err.response?.data?.message || err.message)
  //     setDeliverFiles([])                  // clear for the retry attempt
  //   } finally {
  //     setDelivering(false)
  //   }
  // }

  const handleDeliverSubmit = async () => {
    if (!deliverFiles.length || delivering) return
    setDelivering(true)
    setDeliverError('')
    setDeliverVerdict(null)
    try {
      const data = await updatePickupStatusToDelivered(
        currentOngoingPickup._id,
        inspector._id,
        deliverFiles,
      )
      // no throw = 200 = delivered. show the animation, DON'T refetch yet.
      setDeliverVerdict(data?.verdict || null)   // optional: show the match confidence on success
      setDelivered(true)
    } catch (err) {
      // mismatch (422) or AI failure lands here — show verdict, let them retry
      setDeliverVerdict(err.response?.data?.verdict || null)
      setDeliverError(err.response?.data?.message || err.message)
      setDeliverFiles([])
    } finally {
      setDelivering(false)
    }
  }

  // const closeDeliverModal = () => {
  //   setShowDeliverModal(false)
  //   setDeliverFiles([])
  //   setDeliverError('')
  //   setDeliverVerdict(null)
  //   setDelivered(false)
  // }

  const closeDeliverModal = async () => {
    const wasDelivered = delivered
    setShowDeliverModal(false)
    setDeliverFiles([])
    setDeliverError('')
    setDeliverVerdict(null)
    setDelivered(false)
    if (wasDelivered) {
      await loadInspectorPickups()   // now the pickup moves out of ongoing → history
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Inspector Portal</span>
          </div>
          <h1 className="font-display text-3xl font-bold">
            Hi, {inspector?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-slate-400">
            Manage pickups, track earnings, and serve your locality.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${statusMeta.color}`}>
          {status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          {statusMeta.label}
        </span>
      </div>

      {dashboardMessage && (
        <div className="mb-6">
          <Alert type="success" message={dashboardMessage} onClose={() => setDashboardMessage('')} />
        </div>
      )}

      {/* Status banner */}
      <div className={`mb-8 rounded-2xl border p-5 ${isApproved
        ? 'border-t2c-500/30 bg-t2c-500/10'
        : 'border-amber-500/30 bg-amber-500/10'
        }`}>
        <p className="text-sm leading-relaxed text-slate-300">
          {statusMessages[status]}
        </p>
        {inspector?.rejectionReason && (
          <p className="mt-2 text-sm text-red-400">
            Reason: {inspector.rejectionReason}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Pickups"
          value={stats.totalPickups || 0}
          subtext={`${stats.completedPickups || 0} completed`}
          accent="blue"
        />
        <StatCard
          icon={IndianRupee}
          label="Total Earnings"
          value={`₹${stats.totalEarnings || 0}`}
          subtext="Lifetime earnings"
          accent="coin"
        />
        <StatCard
          icon={Star}
          label="Rating"
          value={stats.rating ? stats.rating.toFixed(1) : '—'}
          subtext={`${stats.totalRatings || 0} reviews`}
          accent="t2c"
        />
        <StatCard
          icon={Truck}
          label="Vehicle"
          value={inspector?.vehicle?.type?.replace('_', ' ') || '—'}
          subtext={inspector?.vehicle?.registrationNumber || 'Not set'}
          accent="blue"
        />
      </div>
      {currentPickup && (
        <div className="mb-8 glass rounded-2xl border border-t2c-500/30 p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Current Pickup</h2>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="mb-1 flex flex-wrap gap-2">
              {currentPickup.wasteTypes?.map((type) => (
                <span key={type} className="rounded border border-t2c-500/30 bg-t2c-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-t2c-400">
                  {type}
                </span>
              ))}
            </div>
            <p className="font-medium text-slate-200">
              {currentPickup.address?.street}, {currentPickup.address?.city}
            </p>

            {!showOtpEntry ? (
              <button
                onClick={() => setShowOtpEntry(true)}
                className="mt-4 rounded-lg bg-t2c-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-t2c-600"
              >
                Confirm Pickup
              </button>
            ) : (
              <div className="mt-4">
                <label className="text-xs uppercase tracking-wider text-slate-500">
                  Enter user's 6-digit OTP
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="______"
                    className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center tracking-[0.3em] text-slate-100 focus:border-t2c-500 focus:outline-none"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpValue.length !== 6 || verifying}
                    className="rounded-lg bg-t2c-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-t2c-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifying ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                </div>
                {otpError && <p className="mt-2 text-sm text-red-400">{otpError}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {currentOngoingPickup && (
        <div className="mb-8 glass rounded-2xl border border-blue-500/30 p-6">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Ongoing Pickup</h2>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-300">
              In transit
            </span>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            {/* moving vehicle scene */}
            <div className="relative mb-4 h-16 overflow-hidden rounded-lg bg-gradient-to-b from-slate-900/60 to-slate-800/40">
              {/* scrolling road dashes (move left → sense of forward motion) */}
              <div className="absolute inset-x-0 bottom-3 h-px">
                <div className="h-full w-[200%] animate-[road_1.2s_linear_infinite] bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.25)_0_16px,transparent_16px_32px)]" />
              </div>

              {/* scenery drifting past, opposite direction, slower = parallax depth */}
              {/* scenery drifting past — two identical halves for a seamless -50% loop */}
              <div className="absolute bottom-4 left-0 flex w-[200%] animate-[scenery_5s_linear_infinite] text-yellow-500">
                {[0, 1].map((half) => (
                  <div key={half} className="flex w-1/2 justify-around">
                    <Package className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                    <Package className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                    <Package className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                    <Package className="h-4 w-4" />
                    <MapPin className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {/* the truck + exhaust */}
              <div className="absolute bottom-2 animate-[drive_12s_ease-in-out_infinite]">
                <span className="absolute -left-3 top-1 h-1.5 w-1.5 rounded-full bg-slate-500/50 animate-[puff_0.9s_ease-out_infinite]" />
                <span className="absolute -left-4 top-2 h-1 w-1 rounded-full bg-slate-500/40 animate-[puff_0.9s_ease-out_infinite_0.3s]" />
                <Truck className="h-7 w-7 text-blue-400" />
              </div>
            </div>

            <div className="mb-1 flex flex-wrap gap-2">
              {currentOngoingPickup.wasteTypes?.map((type) => (
                <span key={type} className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                  {type}
                </span>
              ))}
            </div>
            <p className="font-medium text-slate-200">
              {currentOngoingPickup.address?.street}, {currentOngoingPickup.address?.city}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Waste collected — heading to processing.
            </p>
            <button
              onClick={() => setShowDeliverModal(true)}
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              At the location - Complete Delivery
            </button>
          </div>
          {showDeliverModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="w-full max-w-md glass rounded-2xl border border-white/10 p-6">
                {delivered ? (
                  // success animation
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="relative mb-4">
                      <span className="absolute inset-0 animate-ping rounded-full bg-t2c-500/40" />
                      <CheckCircle2 className="relative h-16 w-16 text-t2c-400 animate-[pop_0.4s_ease-out]" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">Delivered! 🎉</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Waste confirmed at processing. Nice work.
                    </p>
                    {deliverVerdict && (
                      <p className="mt-1 text-xs text-t2c-400/80">
                        Match confidence {deliverVerdict.confidence}%
                      </p>
                    )}
                    <button
                      onClick={closeDeliverModal}
                      className="mt-5 rounded-lg bg-t2c-500 px-5 py-2 text-sm font-medium text-white hover:bg-t2c-600"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-1 font-display text-lg font-semibold">Confirm Delivery</h3>
                    <p className="mb-4 text-sm text-slate-400">
                      Take a photo of the waste at the location. It'll be compared with the
                      original request.
                    </p>

                    {deliverError && (
                      <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                        <p className="text-sm text-red-300">{deliverError}</p>
                        {deliverVerdict && (
                          <p className="mt-1 text-xs text-red-400/80">
                            {deliverVerdict.reason} (match confidence {deliverVerdict.confidence}%)
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">Try again with a clearer photo.</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setDeliverFiles(Array.from(e.target.files).slice(0, 3))}
                      className="mb-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:text-slate-100 hover:file:bg-blue-600"
                    />
                    {deliverFiles.length > 0 && (
                      <p className="mb-3 text-xs text-slate-500">
                        {deliverFiles.length} image{deliverFiles.length > 1 ? 's' : ''} selected
                      </p>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={closeDeliverModal}
                        disabled={delivering}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeliverSubmit}
                        disabled={!deliverFiles.length || delivering}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {delivering ? 'Verifying…' : 'Submit & Verify'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Availability */}
        <div className="glass rounded-2xl p-6 lg:col-span-1">
          <h2 className="mb-4 font-display text-lg font-semibold">Availability</h2>
          {toggleError && (
            <div className="mb-3">
              <Alert type="error" message={toggleError} onClose={() => setToggleError('')} />
            </div>
          )}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="font-medium text-slate-200">
                {inspector?.isAvailable ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-slate-500">
                {isApproved
                  ? 'Toggle when ready to accept pickups'
                  : 'Available after approval'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!!inspector?.isAvailable}
              aria-label={inspector?.isAvailable ? 'Go offline' : 'Go online'}
              disabled={!isApproved || toggling}
              onClick={handleToggleAvailability}
              className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${inspector?.isAvailable ? 'bg-t2c-500' : 'bg-slate-600'
                }`}
            >
              <span
                className={`absolute top-0.5 block h-6 w-6 rounded-full bg-white shadow transition ${inspector?.isAvailable ? 'left-[22px]' : 'left-0.5'
                  } ${toggling ? 'opacity-70' : ''}`}
              />
            </button>
          </div>
          {!isApproved && (
            <p className="mt-3 text-xs text-amber-400">
              Complete verification to go online and receive pickup requests.
            </p>
          )}
        </div>

        {/* Nearby pickups */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Nearby Pickup Requests</h2>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
              {recentPickups.length} available
            </span>
          </div>

          {!isApproved ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center">
              <Bell className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">Pickup requests will appear here after approval.</p>
            </div>
          ) : loadingPickups ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">Loading requests...</p>
            </div>
          ) : recentPickups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center">
              <MapPin className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-slate-400">No pickup requests in your area right now.</p>
              <p className="mt-1 text-xs text-slate-500">
                You will be notified when new requests are available.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {recentPickups.map((item) => {
                const { pickup } = item
                return (
                  <div key={item._id} className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div>
                      <div className="mb-1 flex flex-wrap gap-2">
                        {pickup.wasteTypes?.map((type) => (
                          <span key={type} className="rounded border border-t2c-500/30 bg-t2c-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-t2c-400">
                            {type}
                          </span>
                        ))}
                      </div>
                      <p className="font-medium text-slate-200">
                        {pickup.address?.street}, {pickup.address?.city}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Registered {new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAcceptPickup(item)}
                        className="flex items-center justify-center rounded-lg bg-t2c-500/20 p-2 text-t2c-400 hover:bg-t2c-500 hover:text-white transition-colors"
                        title="Accept Pickup"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemovePickupView(item._id)}
                        className="flex items-center justify-center rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove from view"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isApproved && pickupHistory.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Pickup History</h2>
          <div className="grid gap-3">
            {pickupHistory.map((p) => (
              <div key={p._id} className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                <div>
                  <div className="mb-1 flex flex-wrap gap-2">
                    {p.wasteTypes?.map((type) => (
                      <span key={type} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="font-medium text-slate-200">
                    {p.address?.street}, {p.address?.city}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(p.updatedAt || p.createdAt).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="inline-flex h-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile summary */}
      <div className="mt-6 glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Your Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Email</p>
            <p className="mt-1 text-sm text-slate-200">{inspector?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Phone</p>
            <p className="mt-1 text-sm text-slate-200">{inspector?.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Service area</p>
            <p className="mt-1 text-sm text-slate-200">
              {inspector?.address?.city}, {inspector?.address?.state} — {inspector?.address?.pincode}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">KYC</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200">
              {inspector?.kyc?.aadhaar?.number || inspector?.kyc?.pan?.number ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-t2c-400" />
                  Submitted
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-400" />
                  Not submitted
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Vehicle</p>
            <p className="mt-1 text-sm capitalize text-slate-200">
              {inspector?.vehicle?.name || inspector?.vehicle?.type?.replace('_', ' ') || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Payout</p>
            <p className="mt-1 text-sm text-slate-200">
              {inspector?.bankDetails?.upiId || inspector?.bankDetails?.accountNumber
                ? 'Details on file'
                : 'Not configured'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
