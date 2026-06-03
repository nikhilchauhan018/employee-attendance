import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiCalendar, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { fetchHistory, fetchMonthlySummary } from '../store/slices/attendanceSlice'
import { getMonthName, formatStatusLabel } from '../utils/formatters'
import { STATUS_COLORS } from '../utils/constants'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import CalendarView from '../components/attendance/CalendarView'
import TableView from '../components/attendance/TableView'

export default function Attendance() {
  let dispatch = useDispatch()
  let { history, monthlySummary, loading } = useSelector(s => s.attendance)

  let [view, setView] = useState('calendar')
  let now = new Date()
  let [year, setYear] = useState(now.getFullYear())
  let [month, setMonth] = useState(now.getMonth() + 1)

  let range = useMemo(() => {
    let start = new Date(year, month - 1, 1)
    let end = new Date(year, month, 0)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }, [year, month])

  useEffect(() => {
    dispatch(fetchHistory({ ...range, limit: 31 }))
    dispatch(fetchMonthlySummary({ year, month }))
  }, [dispatch, range, year, month])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  let isCurrent = year === now.getFullYear() && month === now.getMonth() + 1

  // summary stats for quick glance
  let summaryData = monthlySummary?.data || monthlySummary || null
  let statItems = summaryData ? [
    { key: 'present', label: 'Present', value: summaryData.present || 0 },
    { key: 'late', label: 'Late', value: summaryData.late || 0 },
    { key: 'half-day', label: 'Half Day', value: summaryData.halfDay || 0 },
    { key: 'absent', label: 'Absent', value: summaryData.absent || 0 }
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-subtitle">View your attendance records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('calendar')}
            className={`rounded-xl p-2 transition-all ${view === 'calendar' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-muted hover:text-dark'}`}>
            <FiCalendar className="h-5 w-5" />
          </button>
          <button onClick={() => setView('table')}
            className={`rounded-xl p-2 transition-all ${view === 'table' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-muted hover:text-dark'}`}>
            <FiList className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* monthly summary bar */}
      {statItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statItems.map(item => {
            let clr = STATUS_COLORS[item.key] || STATUS_COLORS.absent
            return (
              <div key={item.key} className={`rounded-2xl px-4 py-3 ${clr.bg}`}>
                <p className={`text-xs font-medium ${clr.text} opacity-80`}>{item.label}</p>
                <p className={`text-xl font-bold ${clr.text}`}>{item.value}</p>
              </div>
            )
          })}
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="rounded-xl p-2 text-muted hover:bg-surface hover:text-dark transition-all">
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-dark">{getMonthName(month)} {year}</h2>
          <button onClick={nextMonth} disabled={isCurrent}
            className="rounded-xl p-2 text-muted hover:bg-surface hover:text-dark transition-all disabled:opacity-30">
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? <Spinner /> : view === 'calendar'
          ? <CalendarView year={year} month={month} records={history.records} />
          : <TableView records={history.records} />}
      </Card>
    </div>
  )
}
