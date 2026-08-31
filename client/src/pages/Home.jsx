import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Calendar,
  Coins,
  Leaf,
  Recycle,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: Truck,
    title: 'Doorstep Pickup',
    desc: 'Schedule or ring the bell for instant pickup. We come to your apartment, villa, or gated community.',
  },
  {
    icon: Coins,
    title: 'TrashCoins Rewards',
    desc: 'Earn coins for every pickup based on waste type and weight. Redeem up to 50% in our EcoStore.',
  },
  {
    icon: Sparkles,
    title: 'Gamification & Streaks',
    desc: 'Build weekly streaks, unlock eco badges, and earn bonus rewards for consistent recycling.',
  },
  {
    icon: TrendingUp,
    title: 'Impact Dashboard',
    desc: 'Track waste recycled, CO₂ saved, and your contribution to a cleaner India.',
  },
  {
    icon: Shield,
    title: 'AI Verification',
    desc: 'Multi-step photo verification ensures trust between you, inspectors, and the platform.',
  },
  {
    icon: Store,
    title: 'EcoStore',
    desc: 'Use TrashCoins on essential household products — smart savings from everyday waste.',
  },
]

const steps = [
  { num: '01', title: 'Snap & Schedule', desc: 'Upload trash photos, select categories, and request a doorstep pickup.' },
  { num: '02', title: 'Inspector Assigned', desc: 'Nearby verified inspectors receive your request via hyperlocal matching.' },
  { num: '03', title: 'Pickup & Verify', desc: 'Inspector collects waste, weighs it, and AI verifies the entire chain.' },
  { num: '04', title: 'Earn TrashCoins', desc: 'Coins land in your wallet instantly. Redeem in EcoStore or save up.' },
]

export default function Home() {
  const { user, isInspector, isAdmin } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-t2c-500/10 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-coin-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-t2c-500/30 bg-t2c-500/10 px-4 py-1.5 text-sm text-t2c-300">
              <Leaf className="h-4 w-4" />
              India&apos;s gamified recycling rewards platform
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Your waste{' '}
              <span className="gradient-text">still has value</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Schedule doorstep recycling pickups, earn TrashCoins, and turn everyday waste into
              real rewards. Smart, convenient, and built for Indian households.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isInspector ? (
                <Link
                  to="/inspector/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-xl shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500"
                >
                  <Truck className="h-5 w-5" />
                  Go to Inspector Dashboard
                </Link>
              ) : isAdmin ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-xl shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500"
                >
                  <Shield className="h-5 w-5" />
                  Go to Admin Dashboard
                </Link>
              ) : user ? (
                <Link
                  to="/schedule"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-8 py-3.5 font-semibold text-white shadow-xl shadow-t2c-500/25 transition hover:from-t2c-400 hover:to-emerald-500"
                >
                  <Bell className="h-5 w-5" />
                  Ring the Bell — Schedule Pickup
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-8 py-3.5 font-semibold text-white shadow-xl shadow-t2c-500/25 transition hover:from-t2c-400 hover:to-emerald-500"
                  >
                    Start Earning TrashCoins
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3.5 font-semibold text-slate-200 transition hover:bg-white/5"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
              {[
                { value: '6+', label: 'Waste Categories' },
                { value: '100%', label: 'Doorstep Service' },
                { value: '∞', label: 'TrashCoins to Earn' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4 sm:p-6">
                  <p className="font-display text-2xl font-bold text-t2c-400 sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              More than a pickup app
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Trash2Cash is a gamified sustainability ecosystem — recycling, rewards, and retention in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass group rounded-2xl p-6 transition hover:border-t2c-500/30">
                <div className="mb-4 inline-flex rounded-xl bg-t2c-500/15 p-3 text-t2c-400 transition group-hover:bg-t2c-500/25">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10 bg-gradient-to-b from-transparent to-t2c-950/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How Trash2Cash works</h2>
            <p className="mt-4 text-slate-400">From your doorstep to coins in your wallet — in four simple steps.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative glass rounded-2xl p-6">
                <span className="font-display text-4xl font-bold text-t2c-500/30">{step.num}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspector CTA — only shown to non-inspector visitors */}
      {!isInspector && !isAdmin && (
        <section className="border-t border-white/10 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/50 to-slate-900 p-10 text-center sm:p-14">
              <Truck className="mx-auto mb-4 h-12 w-12 text-blue-400" />
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Earn by collecting recyclables
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-slate-400">
                Register as a Trash2Cash inspector — get nearby pickup requests,
                earn per pickup, and help your community recycle smarter.
              </p>
              <Link
                to="/register/inspector"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-semibold text-white transition hover:from-blue-500 hover:to-indigo-500"
              >
                <Shield className="h-5 w-5" />
                Register as an Inspector
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-white/10 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-t2c-500/20 bg-gradient-to-br from-t2c-900/50 to-slate-900 p-10 text-center sm:p-14">
            <Recycle className="mx-auto mb-4 h-12 w-12 text-t2c-400" />
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Join the recycling movement
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Whether you&apos;re a working professional or a homemaker — every piece of recyclable waste
              is a small but meaningful financial asset.
            </p>
            <Link
              to={isAdmin ? '/dashboard' : user ? '/schedule' : '/register'}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Calendar className="h-5 w-5" />
              {isAdmin ? 'Open Admin Dashboard' : user ? 'Schedule Your First Pickup' : 'Create Free Account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
