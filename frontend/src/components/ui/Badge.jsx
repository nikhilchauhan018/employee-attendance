import { STATUS_COLORS } from '../../utils/constants'
import { formatStatusLabel } from '../../utils/formatters'

export default function Badge({ status, className = '' }) {
  let c = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {formatStatusLabel(status)}
    </span>
  )
}
