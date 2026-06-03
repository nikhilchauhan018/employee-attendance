export function formatTime(dateStr) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  })
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

export function formatHours(hours) {
  if (hours == null) return '0.00'
  return Number(hours).toFixed(2)
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function getMonthName(month) {
  return MONTHS[month - 1] || ''
}

export function formatStatusLabel(status) {
  if (!status) return ''
  return status.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}
