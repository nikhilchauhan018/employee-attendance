// role definitions
const ROLES = Object.freeze({
  EMPLOYEE: 'employee',
  MANAGER: 'manager'
});

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day'
});

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'HR',
  'Finance', 'Operations', 'Support'
];

// office timing configs — pulled from env with fallbacks
const OFFICE_START_HOUR = parseInt(process.env.OFFICE_START_HOUR) || 9;
const LATE_THRESHOLD_MINUTES = parseInt(process.env.LATE_THRESHOLD_MINUTES) || 15;
const MIN_FULL_DAY_HOURS = parseInt(process.env.MIN_FULL_DAY_HOURS) || 6;
const MIN_HALF_DAY_HOURS = parseInt(process.env.MIN_HALF_DAY_HOURS) || 4;

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  DEPARTMENTS,
  OFFICE_START_HOUR,
  LATE_THRESHOLD_MINUTES,
  MIN_FULL_DAY_HOURS,
  MIN_HALF_DAY_HOURS
};
