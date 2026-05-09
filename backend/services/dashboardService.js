const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { getDateOnly } = require('../utils/helpers');
const { ATTENDANCE_STATUS, ROLES } = require('../config/constants');

async function getEmployeeDashboard(userId) {
  let today = getDateOnly();
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  let startOfMonth = new Date(year, month, 1);
  let endOfMonth = new Date(year, month + 1, 0);

  let sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  let [todayRecord, monthRecords, recentRecords, user] = await Promise.all([
    Attendance.findOne({ userId, date: today }),
    Attendance.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    Attendance.find({ userId, date: { $gte: sevenDaysAgo, $lte: today } }).sort({ date: -1 }),
    User.findById(userId).select('createdAt')
  ]);

  let stats = { present: 0, absent: 0, late: 0, halfDay: 0, totalHours: 0 };

  for (let rec of monthRecords) {
    stats.totalHours += rec.totalHours || 0;
    if (rec.status === ATTENDANCE_STATUS.PRESENT) stats.present++;
    else if (rec.status === ATTENDANCE_STATUS.LATE) stats.late++;
    else if (rec.status === ATTENDANCE_STATUS.HALF_DAY) stats.halfDay++;
  }

  // absent = days from max(registration, startOfMonth) to today
  let registeredAt = user ? new Date(user.createdAt) : startOfMonth;
  let regDay = new Date(registeredAt.getFullYear(), registeredAt.getMonth(), registeredAt.getDate());
  let todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let effStart = regDay > startOfMonth ? regDay : startOfMonth;
  let effEnd = todayMid < endOfMonth ? todayMid : endOfMonth;
  let applicableDays = effStart > effEnd ? 0 : Math.floor((effEnd - effStart) / 86400000) + 1;
  let daysWorked = stats.present + stats.late + stats.halfDay;
  stats.absent = Math.max(0, applicableDays - daysWorked);

  stats.totalHours = Math.round(stats.totalHours * 100) / 100;

  return {
    today: todayRecord,
    monthStats: stats,
    recentAttendance: recentRecords
  };
}

async function getManagerDashboard() {
  let today = getDateOnly();
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // weekly trend: last 7 days
  let sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  let [employees, todayRecords, weekRecords] = await Promise.all([
    User.find({ role: ROLES.EMPLOYEE }).select('name email employeeId department createdAt'),
    Attendance.find({ date: today }).populate('userId', 'name email employeeId department'),
    Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } })
  ]);

  let totalEmployees = employees.length;

  // today's breakdown
  let checkedInIds = new Set();
  let presentToday = 0, lateToday = 0, halfDayToday = 0;
  for (let rec of todayRecords) {
    if (rec.userId) checkedInIds.add(rec.userId._id.toString());
    if (rec.status === ATTENDANCE_STATUS.PRESENT) presentToday++;
    else if (rec.status === ATTENDANCE_STATUS.LATE) { lateToday++; presentToday++; }
    else if (rec.status === ATTENDANCE_STATUS.HALF_DAY) { halfDayToday++; presentToday++; }
  }
  let absentToday = totalEmployees - checkedInIds.size;

  // absent employees list — only include employees registered on or before today
  let todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let absentEmployees = employees.filter(emp => {
    let reg = new Date(emp.createdAt);
    let regDay = new Date(reg.getFullYear(), reg.getMonth(), reg.getDate());
    return regDay <= todayMidnight && !checkedInIds.has(emp._id.toString());
  });

  // weekly trend: count per day
  let weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    let d = new Date(today);
    d.setDate(d.getDate() - i);
    let dayStr = d.toISOString().split('T')[0];
    let dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    let count = 0;
    for (let rec of weekRecords) {
      let recDate = new Date(rec.date).toISOString().split('T')[0];
      if (recDate === dayStr && rec.checkInTime) count++;
    }
    // only count employees who were registered by this day
    let registeredByDay = employees.filter(emp => {
      let reg = new Date(emp.createdAt);
      return new Date(reg.getFullYear(), reg.getMonth(), reg.getDate()) <= d;
    }).length;
    weeklyTrend.push({ date: dayStr, day: dayLabel, present: count, absent: registeredByDay - count });
  }

  // department-wise attendance today
  let deptMap = {};
  for (let emp of employees) {
    let dept = emp.department || 'Other';
    if (!deptMap[dept]) deptMap[dept] = { total: 0, present: 0 };
    deptMap[dept].total++;
    if (checkedInIds.has(emp._id.toString())) deptMap[dept].present++;
  }
  let departmentStats = Object.entries(deptMap).map(([dept, val]) => ({
    department: dept,
    total: val.total,
    present: val.present,
    absent: val.total - val.present
  }));

  return {
    totalEmployees,
    todayStats: { present: presentToday, absent: absentToday, late: lateToday, halfDay: halfDayToday },
    absentEmployees,
    weeklyTrend,
    departmentStats
  };
}

module.exports = { getEmployeeDashboard, getManagerDashboard };
