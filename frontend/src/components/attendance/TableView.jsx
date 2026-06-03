import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { formatDate, formatTime, formatHours } from '../../utils/formatters'
import { FiClock } from 'react-icons/fi'

export default function TableView({ records }) {
  if (!records?.length) {
    return (
      <EmptyState
        icon={<FiClock className="h-12 w-12" />}
        title="No attendance records"
        description="No records found for the selected period."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {['Date', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map(rec => (
            <tr key={rec._id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-dark">{formatDate(rec.date)}</td>
              <td className="px-4 py-3 text-muted">{formatTime(rec.checkInTime)}</td>
              <td className="px-4 py-3 text-muted">{formatTime(rec.checkOutTime)}</td>
              <td className="px-4 py-3 text-muted">{formatHours(rec.totalHours)}</td>
              <td className="px-4 py-3"><Badge status={rec.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
