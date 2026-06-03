export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager'
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day'
}

export const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'HR',
  'Finance', 'Operations', 'Support'
]

// status -> tailwind color mapping
export const STATUS_COLORS = {
  present: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  absent: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  late: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'half-day': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' }
}

export const STORAGE_KEYS = {
  USER: 'attendance_user',
  TOKEN: 'attendance_token'
}
