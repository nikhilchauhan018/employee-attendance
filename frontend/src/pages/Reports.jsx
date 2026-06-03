import { useState } from 'react'
import { FiDownload, FiFileText } from 'react-icons/fi'
import { DEPARTMENTS, ATTENDANCE_STATUS, STORAGE_KEYS } from '../utils/constants'
import { formatStatusLabel } from '../utils/formatters'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import { toast } from 'react-toastify'

export default function Reports() {
  let today = new Date()
  // default range: first of current month to today
  let firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

  let [startDate, setStartDate] = useState(firstOfMonth)
  let [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
  let [dept, setDept] = useState('')
  let [status, setStatus] = useState('')
  let [downloading, setDownloading] = useState(false)

  let statusOptions = Object.values(ATTENDANCE_STATUS)

  async function handleExport() {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date')
      return
    }

    setDownloading(true)
    try {
      let params = new URLSearchParams({ startDate, endDate })
      if (dept) params.append('department', dept)
      if (status) params.append('status', status)

      let token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      let response = await fetch(`/api/attendance/team/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        let errData = await response.json().catch(() => null)
        throw new Error(errData?.message || 'Export failed')
      }

      let blob = await response.blob()
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url
      a.download = `attendance-report-${startDate}-to-${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report downloaded successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to export report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Export team attendance data as CSV reports</p>
      </div>

      <Card>
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Attendance Report</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="input-field w-full" />
            </div>
            <Select label="Department" value={dept} onChange={e => setDept(e.target.value)}
              options={DEPARTMENTS} placeholder="All Departments" />
            <Select label="Status" value={status} onChange={e => setStatus(e.target.value)}
              options={statusOptions} placeholder="All Statuses" />
          </div>

          <button onClick={handleExport} disabled={downloading}
            className="btn btn-primary flex items-center gap-2">
            <FiDownload className="h-4 w-4" />
            {downloading ? 'Downloading...' : 'Export CSV'}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Report Information</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>The exported CSV file includes the following columns:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Employee ID</li>
            <li>Name</li>
            <li>Email</li>
            <li>Department</li>
            <li>Date</li>
            <li>Check In Time</li>
            <li>Check Out Time</li>
            <li>Total Hours</li>
            <li>Status (Present, Absent, Late, Half Day)</li>
          </ul>
          <p className="mt-3 text-gray-400">
            <FiFileText className="inline mr-1" />
            Files are saved in CSV format, compatible with Excel, Google Sheets, and other spreadsheet apps.
          </p>
        </div>
      </Card>
    </div>
  )
}
