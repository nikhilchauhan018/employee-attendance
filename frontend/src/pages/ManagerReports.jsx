import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiDownload, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { fetchAllAttendance } from '../store/slices/managerSlice'
import { formatTime, formatHours, formatShortDate } from '../utils/formatters'
import { STORAGE_KEYS } from '../utils/constants'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const PAGE_SIZE = 20

export default function ManagerReports() {
  let dispatch = useDispatch()
  let { allAttendance, loading } = useSelector(s => s.manager)

  let [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: ''
  })
  let [currentPage, setCurrentPage] = useState(1)
  let [searched, setSearched] = useState(false)
  let [exporting, setExporting] = useState(false)

  function handleChange(e) {
    let { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function buildParams(page) {
    let params = { page, limit: PAGE_SIZE }
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.employeeId.trim()) params.employeeId = filters.employeeId.trim()
    return params
  }

  function generateReport(e) {
    e.preventDefault()
    setCurrentPage(1)
    dispatch(fetchAllAttendance(buildParams(1)))
    setSearched(true)
  }

  function goToPage(pg) {
    setCurrentPage(pg)
    dispatch(fetchAllAttendance(buildParams(pg)))
  }

  async function downloadCSV() {
    setExporting(true)
    try {
      let params = new URLSearchParams()
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.employeeId.trim()) params.set('employeeId', filters.employeeId.trim())

      let token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      let resp = await fetch(`/api/attendance/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!resp.ok) {
        let body = await resp.json().catch(() => null)
        throw new Error(body?.message || 'Export failed')
      }

      let blob = await resp.blob()
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url
      a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  let records = allAttendance?.records || []
  let total = allAttendance?.total || 0
  let totalPages = allAttendance?.totalPages || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and export attendance reports</p>
      </div>

      {/* filters */}
      <Card title="Report Parameters">
        <form onSubmit={generateReport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Start Date</label>
            <input type="date" name="startDate" value={filters.startDate}
              onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">End Date</label>
            <input type="date" name="endDate" value={filters.endDate}
              onChange={handleChange} className="input-field" />
          </div>
          <Input label="Employee ID" name="employeeId" value={filters.employeeId}
            onChange={handleChange} placeholder="All employees" />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1" loading={loading && !exporting}>
              <FiSearch className="h-4 w-4" /> Generate
            </Button>
            <Button type="button" variant="success" disabled={!searched || records.length === 0 || exporting}
              loading={exporting} onClick={downloadCSV}>
              <FiDownload className="h-4 w-4" /> CSV
            </Button>
          </div>
        </form>
      </Card>

      {/* results */}
      {searched && (
        <Card title={`Results (${total} records)`}>
          {loading ? <Spinner /> : records.length === 0 ? (
            <EmptyState title="No records found" description="Try adjusting the date range or employee filter" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="table-header">
                    <tr>
                      {['Name', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                      ))}
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
                <div className="flex items-center justify-between border-t border-gray-100 px-4 pt-4 mt-4">
                  <p className="text-sm text-muted">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                      className="rounded-xl p-1.5 text-muted hover:bg-surface disabled:opacity-30 transition-all">
                      <FiChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let p = i + 1
                      if (totalPages > 5) {
                        if (currentPage <= 3) p = i + 1
                        else if (currentPage >= totalPages - 2) p = totalPages - 4 + i
                        else p = currentPage - 2 + i
                      }
                      return (
                        <button key={p} onClick={() => goToPage(p)}
                          className={`h-8 w-8 rounded-xl text-sm font-medium transition-all
                            ${p === currentPage
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'text-muted hover:bg-surface'}`}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                      className="rounded-xl p-1.5 text-muted hover:bg-surface disabled:opacity-30 transition-all">
                      <FiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
