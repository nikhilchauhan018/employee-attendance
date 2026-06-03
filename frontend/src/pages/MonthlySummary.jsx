import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi'
import { fetchMonthlySummary } from '../store/slices/attendanceSlice'
import { getMonthName, formatHours } from '../utils/formatters'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import TableView from '../components/attendance/TableView'

export default function MonthlySummary() {
  let dispatch = useDispatch()
  let { monthlySummary, loading } = useSelector(s => s.attendance)

  let now = new Date()
  let [year, setYear] = useState(now.getFullYear())
  let [month, setMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    dispatch(fetchMonthlySummary({ year, month }))
  }, [dispatch, year, month])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  let isCurrent = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monthly Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Detailed monthly attendance breakdown</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={prevMonth} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 w-48 text-center">
          {getMonthName(month)} {year}
        </h2>
        <button onClick={nextMonth} disabled={isCurrent}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30">
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? <Spinner /> : monthlySummary ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Present Days" value={monthlySummary.present} color="emerald" icon={<FiCheckCircle className="h-5 w-5" />} />
            <StatCard label="Late Days" value={monthlySummary.late} color="amber" icon={<FiClock className="h-5 w-5" />} />
            <StatCard label="Half Days" value={monthlySummary.halfDay} color="orange" icon={<FiAlertCircle className="h-5 w-5" />} />
            <StatCard label="Absent Days" value={monthlySummary.absent} color="red" icon={<FiXCircle className="h-5 w-5" />} />
            <StatCard label="Working Hours" value={formatHours(monthlySummary.totalWorkingHours)} color="blue" icon={<FiClock className="h-5 w-5" />} />
            <StatCard label="Attendance %" value={`${monthlySummary.attendancePercentage}%`} color="primary" icon={<FiTrendingUp className="h-5 w-5" />} />
          </div>

          <Card title="Daily Records">
            <TableView records={monthlySummary.records} />
          </Card>
        </>
      ) : null}
    </div>
  )
}
