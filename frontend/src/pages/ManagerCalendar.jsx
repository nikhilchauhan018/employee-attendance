import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { fetchTeamSummary } from '../store/slices/managerSlice'
import { getMonthName } from '../utils/formatters'
import { STATUS_COLORS } from '../utils/constants'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

export default function ManagerCalendar() {
  let dispatch = useDispatch()
  let { teamSummary, loading } = useSelector(s => s.manager)

  let now = new Date()
  let [year, setYear] = useState(now.getFullYear())
  let [month, setMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    dispatch(fetchTeamSummary({ year, month }))
  }, [dispatch, year, month])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  let summary = teamSummary?.summary || []

  // color coding helper
  function getStatusColor(pct) {
    if (pct >= 90) return 'bg-emerald-100 text-emerald-800'
    if (pct >= 70) return 'bg-amber-100 text-amber-800'
    if (pct >= 50) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Team Calendar View</h1>
        <p className="page-subtitle">Monthly attendance overview per employee</p>
      </div>

      {/* month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevMonth}>
          <FiChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <h2 className="text-lg font-semibold text-dark">{getMonthName(month)} {year}</h2>
        <Button variant="outline" onClick={nextMonth}>
          Next <FiChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* color legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
            <span className="text-xs text-gray-600 capitalize">{status.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <Card>
          {summary.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No employee data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase sticky left-0 bg-surface z-10">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Department</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-emerald-600 uppercase">Present</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-amber-600 uppercase">Late</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-orange-600 uppercase">Half Day</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-red-600 uppercase">Absent</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted uppercase">Hours</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted uppercase">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.map(item => {
                    let emp = item.employee
                    return (
                      <tr key={emp._id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3 sticky left-0 bg-white z-10">
                          <p className="text-sm font-medium text-dark">{emp.name}</p>
                          <p className="text-xs text-muted">{emp.employeeId}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">{emp.department}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">{item.present}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">{item.late}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">{item.halfDay}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-semibold">{item.absent}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-dark font-medium">{item.totalHours}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.attendancePercentage)}`}>
                            {item.attendancePercentage}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
