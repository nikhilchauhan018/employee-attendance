import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { fetchTodayStatus, checkIn, checkOut } from '../store/slices/attendanceSlice'
import { formatTime, formatHours } from '../utils/formatters'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function MarkAttendance() {
  let dispatch = useDispatch()
  let { todayStatus, loading } = useSelector(s => s.attendance)

  useEffect(() => {
    dispatch(fetchTodayStatus())
  }, [dispatch])

  async function doCheckIn() {
    let res = await dispatch(checkIn())
    if (checkIn.fulfilled.match(res)) {
      toast.success('Checked in successfully!')
      dispatch(fetchTodayStatus())
    } else {
      toast.error(res.payload)
    }
  }

  async function doCheckOut() {
    let res = await dispatch(checkOut())
    if (checkOut.fulfilled.match(res)) {
      toast.success('Checked out successfully!')
      dispatch(fetchTodayStatus())
    } else {
      toast.error(res.payload)
    }
  }

  if (loading && !todayStatus) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  let checkedIn = !!todayStatus?.checkInTime
  let checkedOut = !!todayStatus?.checkOutTime

  let todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mark Attendance</h1>
        <p className="page-subtitle">{todayStr}</p>
      </div>

      {/* check in / check out actions */}
      <Card>
        <div className="flex flex-col items-center py-8 space-y-6">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stat-blue mx-auto mb-4">
              <FiClock className="h-8 w-8 text-primary-500" />
            </div>
            <h2 className="text-lg font-semibold text-dark mb-1">
              {!checkedIn ? 'Ready to start your day?' : checkedOut ? 'You are done for today!' : 'Currently working'}
            </h2>
            {todayStatus && (
              <div className="mt-2">
                <Badge status={todayStatus.status} />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="success" disabled={checkedIn} onClick={doCheckIn} className="px-8 py-3 text-base">
              <FiCheckCircle className="h-5 w-5" /> Check In
            </Button>
            <Button variant="danger" disabled={!checkedIn || checkedOut} onClick={doCheckOut} className="px-8 py-3 text-base">
              <FiXCircle className="h-5 w-5" /> Check Out
            </Button>
          </div>
        </div>
      </Card>

      {/* today's record breakdown */}
      {todayStatus && (
        <Card title="Today's Record">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Status</p>
              <Badge status={todayStatus.status} />
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Check In</p>
              <p className="text-xl font-bold text-emerald-600">{formatTime(todayStatus.checkInTime)}</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Check Out</p>
              <p className="text-xl font-bold text-red-500">{formatTime(todayStatus.checkOutTime)}</p>
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Hours Worked</p>
              <p className="text-xl font-bold text-primary-500">{formatHours(todayStatus.totalHours)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
