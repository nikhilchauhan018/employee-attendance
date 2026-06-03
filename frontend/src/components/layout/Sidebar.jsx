import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiHome, FiClock, FiBarChart2, FiX, FiUser, FiCheckSquare, FiUsers, FiCalendar, FiDownload } from 'react-icons/fi'
import { ROLES } from '../../utils/constants'

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/mark-attendance', label: 'Mark Attendance', icon: FiCheckSquare },
  { to: '/attendance', label: 'My Attendance', icon: FiClock },
  { to: '/profile', label: 'Profile', icon: FiUser }
]

const managerLinks = [
  { to: '/manager/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/manager/attendance', label: 'All Attendance', icon: FiUsers },
  { to: '/manager/calendar', label: 'Team Calendar', icon: FiCalendar },
  { to: '/manager/reports', label: 'Reports', icon: FiDownload },
  { to: '/profile', label: 'Profile', icon: FiUser }
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector(s => s.auth)

  let links = user?.role === ROLES.MANAGER ? managerLinks : employeeLinks

  function linkCls({ isActive }) {
    let base = 'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 mr-5'
    return isActive
      ? `${base} bg-white text-primary-700 rounded-r-[25px] shadow-sm`
      : `${base} text-white/80 hover:text-white hover:bg-white/10 rounded-r-[25px]`
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #5b5a8e 0%, #3d3c6b 100%)' }}>

        {/* logo section */}
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <FiCheckSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">AttendanceHQ</h1>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-white/60 hover:text-white lg:hidden">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* navigation */}
        <nav className="flex flex-col gap-1 mt-4">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={linkCls} onClick={onClose}>
              <link.icon className="h-5 w-5 flex-shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* user info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
            <p className="text-xs text-white/80 font-medium capitalize mt-1">
              {user?.role} &middot; {user?.employeeId}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
