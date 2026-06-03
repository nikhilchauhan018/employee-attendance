import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { fetchManagerDashboard } from '../store/slices/managerSlice'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function ManagerDashboard() {
  let dispatch = useDispatch()
  let { dashboard, loading } = useSelector(s => s.manager)

  useEffect(() => {
    dispatch(fetchManagerDashboard())
  }, [dispatch])

  if (loading && !dashboard) return <Spinner size="lg" />

  let today = dashboard?.todayStats || {}
  let weekly = dashboard?.weeklyTrend || []
  let deptStats = dashboard?.departmentStats || []
  let absentList = dashboard?.absentEmployees || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">Team attendance overview</p>
      </div>

      {/* top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Employees" value={dashboard?.totalEmployees || 0}
          color="blue" icon={<FiUsers className="h-5 w-5" />} />
        <StatCard label="Present Today" value={today.present || 0}
          color="emerald" icon={<FiCheckCircle className="h-5 w-5" />} />
        <StatCard label="Absent Today" value={today.absent || 0}
          color="red" icon={<FiXCircle className="h-5 w-5" />} />
        <StatCard label="Late Today" value={today.late || 0}
          color="amber" icon={<FiClock className="h-5 w-5" />} />
        <StatCard label="Half Day" value={today.halfDay || 0}
          color="orange" icon={<FiAlertCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* weekly attendance trend */}
        <Card title="Weekly Attendance Trend">
          {weekly.length > 0 ? (
            <div className="space-y-3">
              {weekly.map(day => {
                let total = dashboard?.totalEmployees || 1
                let pct = Math.round((day.present / total) * 100)
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted w-10">{day.day}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 8)}%`, background: 'linear-gradient(90deg, #5b5a8e, #8d8cb2)' }}>
                        <span className="text-xs font-semibold text-white">{day.present}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted w-10 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No data available</p>
          )}
        </Card>

        {/* department-wise attendance */}
        <Card title="Department-wise Attendance (Today)">
          {deptStats.length > 0 ? (
            <div className="space-y-3">
              {deptStats.map(dept => {
                let pct = dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0
                return (
                  <div key={dept.department} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-dark w-24 truncate">{dept.department}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 8)}%`, background: 'linear-gradient(90deg, #5b5a8e, #8d8cb2)' }}>
                        <span className="text-xs font-semibold text-white">{dept.present}/{dept.total}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted w-10 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No data available</p>
          )}
        </Card>
      </div>

      {/* absent employees today */}
      <Card title="Absent Employees Today">
        {absentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Employee ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {absentList.map(emp => (
                  <tr key={emp._id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-dark">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-muted">{emp.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-muted">{emp.department}</td>
                    <td className="px-4 py-3"><Badge status="absent" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-emerald-600 text-center py-6 font-medium">All employees are present today!</p>
        )}
      </Card>
    </div>
  )
}
