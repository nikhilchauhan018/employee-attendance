import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './utils/constants'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MarkAttendance from './pages/MarkAttendance'
import Attendance from './pages/Attendance'
import Profile from './pages/Profile'

// manager pages
import ManagerDashboard from './pages/ManagerDashboard'
import AllAttendance from './pages/AllAttendance'
import ManagerCalendar from './pages/ManagerCalendar'
import ManagerReports from './pages/ManagerReports'

function PublicRoute({ children }) {
  const { user } = useSelector(s => s.auth)
  if (user) {
    let dest = user.role === ROLES.MANAGER ? '/manager/dashboard' : '/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  const { user } = useSelector(s => s.auth)

  let defaultRoute = '/login'
  if (user) defaultRoute = user.role === ROLES.MANAGER ? '/manager/dashboard' : '/dashboard'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* employee routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mark-attendance" element={<MarkAttendance />} />
            <Route path="/attendance" element={<Attendance />} />
          </Route>
        </Route>

        {/* manager routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
          <Route element={<AppLayout />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/attendance" element={<AllAttendance />} />
            <Route path="/manager/calendar" element={<ManagerCalendar />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
          </Route>
        </Route>

        {/* shared routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
        newestOnTop closeOnClick pauseOnHover theme="colored" />
    </BrowserRouter>
  )
}
