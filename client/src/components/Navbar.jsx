import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Leaf, Menu, X, Coins, LogOut, User, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import NotificationsDropdown from './NotificationsDropdown'

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-t2c-500/20 text-t2c-300'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

const inspectorNavLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-500/20 text-blue-300'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

export default function Navbar() {
  const { user, isInspector, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = isInspector ? user?.fullName?.split(' ')[0] : user?.firstName

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-t2c-500 to-emerald-700 shadow-lg shadow-t2c-500/20">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Trash<span className="text-t2c-400">2</span>Cash
            </span>
            <p className="hidden text-[10px] uppercase tracking-widest text-slate-500 sm:block">
              {isInspector ? 'Inspector Portal' : isAdmin ? 'Admin Portal' : 'Recycle · Reward · Repeat'}
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {user ? (
            isInspector ? (
              <>
                <NavLink to="/inspector/dashboard" className={inspectorNavLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/inspector/profile" className={inspectorNavLinkClass}>
                  Profile
                </NavLink>
              </>
            ) : isAdmin ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/schedule" className={navLinkClass}>
                  Schedule Pickup
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                  History
                </NavLink>
              </>
            )
          ) : (
            <>
              <a href="/#features" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
                Features
              </a>
              <a href="/#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
                How it Works
              </a>
              <Link
                to="/register/inspector"
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
              >
                Be an Inspector
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {!isInspector && !isAdmin && (
                <div className="flex items-center gap-1.5 rounded-full border border-coin-500/30 bg-coin-500/10 px-3 py-1.5 text-sm font-semibold text-coin-400">
                  <Coins className="h-4 w-4" />
                  <span>TrashCoins</span>
                </div>
              )}
              {isInspector && (
                <div className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Inspector</span>
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-semibold text-violet-300">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </div>
              )}
              {!isInspector && (
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  <User className="h-4 w-4 text-t2c-400" />
                  {displayName}
                </NavLink>
              )}
              {isInspector && (
                <span className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
                  <User className="h-4 w-4 text-blue-400" />
                  {displayName}
                </span>
              )}
              {isInspector && (
                <NotificationsDropdown />
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-red-400"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-200 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-t2c-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-t2c-500/25 transition hover:from-t2c-400 hover:to-emerald-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && isInspector && <NotificationsDropdown />}
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            {user ? (
              isInspector ? (
                <>
                  <NavLink to="/inspector/dashboard" className={inspectorNavLinkClass} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/inspector/profile" className={inspectorNavLinkClass} onClick={() => setMobileOpen(false)}>
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-white/5"
                  >
                    Log out
                  </button>
                </>
              ) : isAdmin ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-white/5"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/schedule" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Schedule Pickup
                  </NavLink>
                  <NavLink to="/history" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    History
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-white/5"
                  >
                    Log out
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/register/inspector" className={navLinkClass({ isActive: false })} onClick={() => setMobileOpen(false)}>
                  Be an Inspector
                </Link>
                <Link to="/login" className={navLinkClass({ isActive: false })} onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="mt-2 rounded-xl bg-t2c-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
