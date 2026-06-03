import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { fetchAllAttendance } from '../store/slices/managerSlice'
import { ATTENDANCE_STATUS } from '../utils/constants'
import { formatTime, formatHours, formatShortDate } from '../utils/formatters'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function AllAttendance() {
  let dispatch = useDispatch()
  let { allAttendance, loading } = useSelector(s => s.manager)

  let [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
    page: 1
  })

  useEffect(() => {
    let params = { page: filters.page, limit: 20 }
    if (filters.employeeId.trim()) params.employeeId = filters.employeeId.trim()
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.status) params.status = filters.status
    dispatch(fetchAllAttendance(params))
  }, [dispatch, filters.page])

  function applyFilters(e) {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    let params = { page: 1, limit: 20 }
    if (filters.employeeId.trim()) params.employeeId = filters.employeeId.trim()
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.status) params.status = filters.status
    dispatch(fetchAllAttendance(params))
  }

  function clearFilters() {
    let cleared = { employeeId: '', startDate: '', endDate: '', status: '', page: 1 }
    setFilters(cleared)
    dispatch(fetchAllAttendance({ page: 1, limit: 20 }))
  }

  function handleFilterChange(e) {
    let { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  let records = allAttendance?.records || []
  let { total, page, totalPages } = allAttendance

  let statuses = Object.values(ATTENDANCE_STATUS).map(s => ({
    value: s, label: s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">All Employees Attendance</h1>
        <p className="page-subtitle">View and filter attendance records</p>
      </div>

      {/* filter bar */}
      <Card>
        <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Input label="Employee ID" name="employeeId" value={filters.employeeId}
            onChange={handleFilterChange} placeholder="e.g. EMP0001" />
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Start Date</label>
            <input type="date" name="startDate" value={filters.startDate}
              onChange={handleFilterChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">End Date</label>
            <input type="date" name="endDate" value={filters.endDate}
              onChange={handleFilterChange} className="input-field" />
          </div>
          <Select label="Status" name="status" value={filters.status}
            onChange={handleFilterChange} options={statuses} placeholder="All statuses" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <FiSearch className="h-4 w-4" /> Search
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </form>
      </Card>

      {/* results table */}
      <Card>
        {loading ? <Spinner /> : records.length === 0 ? (
          <EmptyState title="No records found" description="Try adjusting your filters" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Employee ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map(rec => {
                    let u = rec.userId || {}
                    return (
                      <tr key={rec._id} className="hover:bg-surface transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-dark">{u.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-muted">{u.employeeId || '-'}</td>
                        <td className="px-4 py-3 text-sm text-muted">{u.department || '-'}</td>
                        <td className="px-4 py-3 text-sm text-dark">{formatShortDate(rec.date)}</td>
                        <td className="px-4 py-3 text-sm text-muted">{formatTime(rec.checkInTime)}</td>
                        <td className="px-4 py-3 text-sm text-muted">{formatTime(rec.checkOutTime)}</td>
                        <td className="px-4 py-3 text-sm text-muted">{formatHours(rec.totalHours)}</td>
                        <td className="px-4 py-3"><Badge status={rec.status} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-muted">
                  Showing page {page} of {totalPages} ({total} records)
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}>
                    <FiChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button variant="outline" disabled={page >= totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}>
                    Next <FiChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
