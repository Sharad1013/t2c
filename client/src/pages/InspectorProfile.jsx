import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateInspectorProfile } from '../api/inspector'
import Alert from '../components/Alert'
import {
  Camera,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Truck,
  User,
  ChevronDown
} from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-400" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-slate-500">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
      />
    </div>
  )
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-slate-500">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
        >
          <option value="" disabled>Select type</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </div>
  )
}

export default function InspectorProfile() {
  const { user: inspector, updateLocalUser } = useAuth()

  const [form, setForm] = useState({
    fullName: inspector?.fullName || '',
    phone: inspector?.phone || '',
    'address.street': inspector?.address?.street || '',
    'address.city': inspector?.address?.city || '',
    'address.state': inspector?.address?.state || '',
    'address.pincode': inspector?.address?.pincode || '',
    'vehicle.name': inspector?.vehicle?.name || '',
    'vehicle.registrationNumber': inspector?.vehicle?.registrationNumber || '',
    'vehicle.type': inspector?.vehicle?.type || '',
    'bankDetails.accountHolderName': inspector?.bankDetails?.accountHolderName || '',
    'bankDetails.accountNumber': inspector?.bankDetails?.accountNumber || '',
    'bankDetails.ifscCode': inspector?.bankDetails?.ifscCode || '',
    'bankDetails.upiId': inspector?.bankDetails?.upiId || '',
  })

  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(inspector?.profilePhoto || null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val)
      })
      if (photoFile) formData.append('profilePhoto', photoFile)

      const data = await updateInspectorProfile(formData)
      updateLocalUser(data.inspector)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-blue-400" />
        <div>
          <h1 className="font-display text-3xl font-bold">Inspector Profile</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your personal details and payout info.</p>
        </div>
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

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Photo + personal */}
        <Section icon={User} title="Personal Details">
          <div className="mb-6 flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-blue-500/30 bg-slate-800">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <label
                htmlFor="photoInput"
                className="absolute -bottom-1 -right-1 cursor-pointer rounded-full border border-white/10 bg-slate-700 p-1.5 text-slate-300 hover:bg-blue-600 hover:text-white transition"
              >
                <Camera className="h-3.5 w-3.5" />
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-slate-200">{inspector?.fullName}</p>
              <p className="text-xs text-slate-500">{inspector?.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                <ShieldCheck className="h-3 w-3" /> Inspector
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" />
          </div>
        </Section>

        {/* Address */}
        <Section icon={MapPin} title="Address">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Street" name="address.street" value={form['address.street']} onChange={handleChange} placeholder="Street / locality" />
            </div>
            <Field label="City" name="address.city" value={form['address.city']} onChange={handleChange} placeholder="City" />
            <Field label="State" name="address.state" value={form['address.state']} onChange={handleChange} placeholder="State" />
            <Field label="Pincode" name="address.pincode" value={form['address.pincode']} onChange={handleChange} placeholder="6-digit pincode" />
          </div>
        </Section>

        {/* Vehicle */}
        {/* <Section icon={Truck} title="Vehicle Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle Name / Model" name="vehicle.name" value={form['vehicle.name']} onChange={handleChange} placeholder="e.g. Honda Activa" />
            <Field label="Registration Number" name="vehicle.registrationNumber" value={form['vehicle.registrationNumber']} onChange={handleChange} placeholder="e.g. MH 01 AB 1234" />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Vehicle type: <span className="text-slate-300 capitalize">{inspector?.vehicle?.type?.replace('_', ' ') || '—'}</span> (cannot be changed after registration)
          </p>
        </Section> */}
        <Section icon={Truck} title="Vehicle Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Vehicle Type"
              name="vehicle.type"
              value={form['vehicle.type']}
              onChange={handleChange}
              options={[
                { value: 'bike', label: 'Bike' },
                { value: 'cycle', label: 'Cycle' },
                { value: 'mini_van', label: 'Mini Van' },
                { value: 'auto', label: 'Auto' },
                { value: 'pickup_truck', label: 'Pickup Truck' },

              ]}
            />
            <Field label="Vehicle Name / Model" name="vehicle.name" value={form['vehicle.name']} onChange={handleChange} placeholder="e.g. Honda Activa" />
            <div className="sm:col-span-2">
              <Field label="Registration Number" name="vehicle.registrationNumber" value={form['vehicle.registrationNumber']} onChange={handleChange} placeholder="e.g. MH 01 AB 1234" />
            </div>
          </div>
        </Section>

        {/* Payout */}
        <Section icon={IndianRupee} title="Payout Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account Holder Name" name="bankDetails.accountHolderName" value={form['bankDetails.accountHolderName']} onChange={handleChange} placeholder="Name as on bank" />
            <Field label="Account Number" name="bankDetails.accountNumber" value={form['bankDetails.accountNumber']} onChange={handleChange} placeholder="Account number" />
            <Field label="IFSC Code" name="bankDetails.ifscCode" value={form['bankDetails.ifscCode']} onChange={handleChange} placeholder="e.g. SBIN0001234" />
            <Field label="UPI ID" name="bankDetails.upiId" value={form['bankDetails.upiId']} onChange={handleChange} placeholder="name@upi" />
          </div>
        </Section>

        {/* KYC read-only */}
        <Section icon={CheckCircle2} title="KYC Status">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 p-3">
              <CheckCircle2 className={`h-4 w-4 ${inspector?.kyc?.aadhaar?.number ? 'text-t2c-400' : 'text-slate-600'}`} />
              <div>
                <p className="text-xs text-slate-500">Aadhaar</p>
                <p className="text-sm text-slate-300">{inspector?.kyc?.aadhaar?.number || 'Not submitted'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 p-3">
              <CheckCircle2 className={`h-4 w-4 ${inspector?.kyc?.pan?.number ? 'text-t2c-400' : 'text-slate-600'}`} />
              <div>
                <p className="text-xs text-slate-500">PAN</p>
                <p className="text-sm text-slate-300">{inspector?.kyc?.pan?.number || 'Not submitted'}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">KYC documents cannot be updated here. Contact support if needed.</p>
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
