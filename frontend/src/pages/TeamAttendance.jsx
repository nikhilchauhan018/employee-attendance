import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiUsers, FiSearch } from 'react-icons/fi'
import { fetchTeamAttendance } from '../store/slices/attendanceSlice'
import { DEPARTMENTS, ATTENDANCE_STATUS } from '../utils/constants'
import { formatTime, formatHours } from '../utils/formatters'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Select from '../components/ui/Select'

export default function TeamAttendance() {
  let dispatch = useDispatch()
  let { teamRecords, loading } = useSelector(s => s.attendance)

  let [date, setDate] = useState(new Date().toISOString().split('T')[0])
  let [dept, setDept] = useState('')
  let [status, setStatus] = useState('')
  let [search, setSearch] = useState('')
  let [searchDebounce, setSearchDebounce] = useState('')

  // debounce the search input
  useEffect(() => {
    let timer = setTimeout(() => setSearchDebounce(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let params = { date }
    if (dept) params.department = dept
    if (status) params.status = status
    if (searchDebounce.trim()) params.employee = searchDebounce.trim()
    dispatch(fetchTeamAttendance(params))
  }, [dispatch, date, dept, status, searchDebounce])

  let statusOptions = Object.values(ATTENDANCE_STATUS)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage team attendance records</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto" />
          </div>
          <Select label="Department" value={dept} onChange={e => setDept(e.target.value)}
            options={DEPARTMENTS} placeholder="All Departments" className="w-48" />
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value)}
            options={statusOptions} placeholder="All Statuses" className="w-40" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Employee</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Name or ID..." className="input-field pl-9 w-48" />
            </div>
          </div>
          <span className="text-sm text-gray-500 pb-2">{teamRecords.total} records</span>
        </div>

        {loading ? <Spinner /> : teamRecords.records.length === 0 ? (
          <EmptyState icon={<FiUsers className="h-12 w-12" />}
            title="No records found" description="No attendance records for the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Employee', 'ID', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamRecords.records.map(rec => (
                  <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{rec.user?.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{rec.user?.employeeId}</td>
                    <td className="px-4 py-3 text-gray-600">{rec.user?.department}</td>
                    <td className="px-4 py-3 text-gray-600">{formatTime(rec.checkInTime)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatTime(rec.checkOutTime)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatHours(rec.totalHours)}</td>
                    <td className="px-4 py-3"><Badge status={rec.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
