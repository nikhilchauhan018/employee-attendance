import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiMail, FiHash, FiBriefcase, FiShield } from 'react-icons/fi'
import { fetchProfile } from '../store/slices/authSlice'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

export default function Profile() {
  let dispatch = useDispatch()
  let { user, loading } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  if (loading && !user) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details</p>
      </div>

      {/* account info — read only */}
      <Card title="Account Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-stat-blue p-2.5">
              <FiUser className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-muted">Full Name</p>
              <p className="text-sm font-medium text-dark">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-stat-blue p-2.5">
              <FiMail className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-dark">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-stat-yellow p-2.5">
              <FiHash className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted">Employee ID</p>
              <p className="text-sm font-medium text-dark">{user?.employeeId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-stat-green p-2.5">
              <FiShield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted">Role</p>
              <p className="text-sm font-medium text-dark capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-stat-pink p-2.5">
              <FiBriefcase className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted">Department</p>
              <p className="text-sm font-medium text-dark">{user?.department}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
