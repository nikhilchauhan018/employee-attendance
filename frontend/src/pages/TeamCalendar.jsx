import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import { fetchTeamCalendar } from '../store/slices/attendanceSlice'
import { DEPARTMENTS, STATUS_COLORS } from '../utils/constants'
import { getMonthName, formatStatusLabel } from '../utils/formatters'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TeamCalendar() {
  let dispatch = useDispatch()
  let { teamCalendar, loading } = useSelector(s => s.attendance)

  let now = new Date()
  let [year, setYear] = useState(now.getFullYear())
  let [month, setMonth] = useState(now.getMonth() + 1)
  let [dept, setDept] = useState('')

  useEffect(() => {
    let params = { year, month }
    if (dept) params.department = dept
    dispatch(fetchTeamCalendar(params))
  }, [dispatch, year, month, dept])

  function goBack() {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else setMonth(month - 1)
  }
  function goForward() {
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else setMonth(month + 1)
  }

  // figure out days in the month
  let totalDays = new Date(year, month, 0).getDate()
  let days = Array.from({ length: totalDays }, (_, i) => i + 1)

  let employees = teamCalendar?.employees || []

  // build attendance lookup per employee: { empId -> { day -> status } }
  let lookup = useMemo(() => {
    let map = {}
    for (let emp of employees) {
      let dayMap = {}
      for (let rec of emp.records) {
        let d = new Date(rec.date).getDate()
        dayMap[d] = rec.status
      }
      map[emp.user.employeeId] = dayMap
    }
    return map
  }, [employees])

  // short status labels for grid cells
  function shortLabel(status) {
    if (!status) return ''
    let labels = { present: 'P', absent: 'A', late: 'L', 'half-day': 'H' }
    return labels[status] || status[0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">Monthly attendance overview for all employees</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="btn btn-outline p-2"><FiChevronLeft /></button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
              {getMonthName(month)} {year}
            </h2>
            <button onClick={goForward} className="btn btn-outline p-2"><FiChevronRight /></button>
          </div>
          <Select value={dept} onChange={e => setDept(e.target.value)}
            options={DEPARTMENTS} placeholder="All Departments" className="w-48" />
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          {Object.entries(STATUS_COLORS).map(([st, clr]) => (
            <span key={st} className="flex items-center gap-1.5">
              <span className={`inline-block w-3 h-3 rounded ${clr.dot}`} />
              {formatStatusLabel(st)}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-gray-200" />
            No Record
          </span>
        </div>

        {loading ? <Spinner /> : employees.length === 0 ? (
          <EmptyState icon={<FiCalendar className="h-12 w-12" />}
            title="No data" description="No attendance records found for this month." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 sticky left-0 bg-white z-10 min-w-[140px]">Employee</th>
                  {days.map(d => (
                    <th key={d} className="px-1 py-2 text-center font-medium text-gray-500 min-w-[28px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => {
                  let empDays = lookup[emp.user.employeeId] || {}
                  return (
                    <tr key={emp.user.employeeId} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white whitespace-nowrap">
                        <div>{emp.user.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{emp.user.employeeId}</div>
                      </td>
                      {days.map(d => {
                        let st = empDays[d]
                        let clr = st ? STATUS_COLORS[st] : null
                        return (
                          <td key={d} className="px-0.5 py-1 text-center">
                            {st ? (
                              <span className={`inline-block w-6 h-6 leading-6 rounded text-[10px] font-bold ${clr.bg} ${clr.text}`}
                                title={`${formatStatusLabel(st)} - Day ${d}`}>
                                {shortLabel(st)}
                              </span>
                            ) : (
                              <span className="inline-block w-6 h-6 leading-6 rounded bg-gray-50 text-gray-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
