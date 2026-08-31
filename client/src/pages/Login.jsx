import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      const redirectTo =
        data.role === 'inspector'
          ? '/inspector/dashboard'
          : data.role === 'admin'
            ? '/dashboard'
            : from
      navigate(redirectTo, { replace: true, state: { welcome: data.message } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-t2c-500/20">
            <LogIn className="h-7 w-7 text-t2c-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Log in to schedule pickups and earn TrashCoins</p>
        </div>

        <form onSubmit={handleSubmit} className="glass space-y-5 rounded-2xl p-6 sm:p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-t2c-500 focus:outline-none focus:ring-1 focus:ring-t2c-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 py-3 font-semibold text-white transition hover:from-t2c-400 hover:to-emerald-500 disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-t2c-400 hover:text-t2c-300">
            Sign up free
          </Link>
        </p>

        <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <p className="text-xs text-slate-400">Want to join as a pickup agent?</p>
          <Link
            to="/register/inspector"
            className="mt-2 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Register as an Inspector →
          </Link>
        </div>
      </div>
    </div>
  )
}
