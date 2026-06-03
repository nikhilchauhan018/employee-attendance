import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'

export default function Header({ onMenuClick }) {
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let { user } = useSelector(s => s.auth)

  function doLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-surface px-4 lg:px-6">
      <button onClick={onMenuClick} className="rounded-xl p-2 text-muted hover:bg-white hover:shadow-sm lg:hidden transition-all">
        <FiMenu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-muted">
          Welcome back, <span className="font-semibold text-dark">{user?.name}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 shadow-sm">
          <FiUser className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-semibold text-dark">{user?.employeeId}</span>
        </div>
        <button onClick={doLogout}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-red-50 hover:text-red-500 transition-all">
          <FiLogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
