import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { fetchDashboard, checkIn, checkOut } from '../store/slices/attendanceSlice'
import { formatTime, formatHours, formatShortDate, formatStatusLabel } from '../utils/formatters'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  let dispatch = useDispatch()
  let { user } = useSelector(s => s.auth)
  let { dashboard, loading } = useSelector(s => s.attendance)

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  async function doCheckIn() {
    let res = await dispatch(checkIn())
    if (checkIn.fulfilled.match(res)) {
      toast.success('Checked in!')
      dispatch(fetchDashboard())
    } else {
      toast.error(res.payload)
    }
  }

  async function doCheckOut() {
    let res = await dispatch(checkOut())
    if (checkOut.fulfilled.match(res)) {
      toast.success('Checked out!')
      dispatch(fetchDashboard())
    } else {
      toast.error(res.payload)
    }
  }

  if (loading && !dashboard) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  let today = dashboard?.today
  let stats = dashboard?.monthStats
  let recent = dashboard?.recentAttendance || []

  let checkedIn = !!today?.checkInTime
  let checkedOut = !!today?.checkOutTime

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Here&apos;s your attendance overview.</p>
      </div>

      {/* today's status */}
      <Card title="Today's Attendance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Status</p>
            {today ? <Badge status={today.status} /> : <span className="text-sm text-muted">Not checked in</span>}
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Check In</p>
            <p className="text-lg font-semibold text-dark">{formatTime(today?.checkInTime)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Check Out</p>
            <p className="text-lg font-semibold text-dark">{formatTime(today?.checkOutTime)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Hours Worked</p>
            <p className="text-lg font-semibold text-dark">{formatHours(today?.totalHours)}</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-gray-100">
          <Button variant="success" disabled={checkedIn} onClick={doCheckIn}>
            <FiCheckCircle className="h-4 w-4" /> Check In
          </Button>
          <Button variant="danger" disabled={!checkedIn || checkedOut} onClick={doCheckOut}>
            <FiXCircle className="h-4 w-4" /> Check Out
          </Button>
        </div>
      </Card>

      {/* monthly stats */}
      {stats && (
        <>
          <h2 className="text-lg font-semibold text-dark">Monthly Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Present" value={stats.present} color="emerald" icon={<FiCheckCircle className="h-5 w-5" />} />
            <StatCard label="Late" value={stats.late} color="amber" icon={<FiClock className="h-5 w-5" />} />
            <StatCard label="Half Day" value={stats.halfDay} color="orange" icon={<FiAlertCircle className="h-5 w-5" />} />
            <StatCard label="Absent" value={stats.absent} color="red" icon={<FiXCircle className="h-5 w-5" />} />
            <StatCard label="Total Hours" value={formatHours(stats.totalHours)} color="primary"
              icon={<FiTrendingUp className="h-5 w-5" />} />
          </div>
        </>
      )}

      {/* recent 7 days */}
      {recent.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-dark">Recent Attendance</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map(rec => (
                    <tr key={rec._id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3 text-sm text-dark">{formatShortDate(rec.date)}</td>
                      <td className="px-4 py-3 text-sm text-muted">{formatTime(rec.checkInTime)}</td>
                      <td className="px-4 py-3 text-sm text-muted">{formatTime(rec.checkOutTime)}</td>
                      <td className="px-4 py-3 text-sm text-muted">{formatHours(rec.totalHours)}</td>
                      <td className="px-4 py-3"><Badge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
