import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiUsers } from 'react-icons/fi'
import { fetchTeamSummary } from '../store/slices/attendanceSlice'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

export default function TeamOverview() {
  let dispatch = useDispatch()
  let { teamSummary, loading } = useSelector(s => s.attendance)

  useEffect(() => { dispatch(fetchTeamSummary()) }, [dispatch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Today&apos;s attendance summary across all departments</p>
      </div>

      {loading ? <Spinner /> : teamSummary ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Present" value={teamSummary.present} color="emerald" icon={<FiCheckCircle className="h-5 w-5" />} />
            <StatCard label="Late" value={teamSummary.late} color="amber" icon={<FiClock className="h-5 w-5" />} />
            <StatCard label="Half Day" value={teamSummary.halfDay} color="orange" icon={<FiAlertCircle className="h-5 w-5" />} />
            <StatCard label="Absent" value={teamSummary.absent} color="red" icon={<FiXCircle className="h-5 w-5" />} />
            <StatCard label="Total Records" value={teamSummary.total} color="blue" icon={<FiUsers className="h-5 w-5" />} />
          </div>

          <Card>
            <div className="text-center py-8">
              <FiUsers className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Attendance Distribution</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Out of {teamSummary.total} total records today,{' '}
                {teamSummary.present + teamSummary.late} employees are on time or marked present
                {teamSummary.absent > 0 && ` and ${teamSummary.absent} are absent`}.
              </p>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-center text-gray-500 py-8">No data available for today</p>
        </Card>
      )}
    </div>
  )
}
