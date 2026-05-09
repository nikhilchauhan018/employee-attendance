const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { getDateOnly, calculateHoursBetween, getDaysInMonth } = require('../utils/helpers');
const {
  ATTENDANCE_STATUS,
  ROLES,
  OFFICE_START_HOUR,
  LATE_THRESHOLD_MINUTES,
  MIN_FULL_DAY_HOURS,
  MIN_HALF_DAY_HOURS
} = require('../config/constants');

// figure out if they're late based on check-in time
function determineStatus(checkInTime) {
  let d = new Date(checkInTime);
  let officeStart = new Date(d);
  officeStart.setHours(OFFICE_START_HOUR, LATE_THRESHOLD_MINUTES, 0, 0);

  return d > officeStart ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;
}

// after checkout, re-evaluate based on total hours worked
// absent is never assigned here — it's derived in monthly summary
function statusAfterCheckout(hours, initialStatus) {
  if (hours >= MIN_FULL_DAY_HOURS) return ATTENDANCE_STATUS.PRESENT;
  if (hours >= MIN_HALF_DAY_HOURS) return ATTENDANCE_STATUS.HALF_DAY;
  // less than min half-day hours — keep the original check-in status
  return initialStatus;
}

async function checkIn(userId) {
  let today = getDateOnly();
  let existing = await Attendance.findOne({ userId, date: today });

  if (existing && existing.checkInTime) {
    throw new ApiError(400, 'Already checked in today');
  }

  let now = new Date();
  let status = determineStatus(now);

  if (existing) {
    existing.checkInTime = now;
    existing.status = status;
    await existing.save();
    return existing;
  }

  return Attendance.create({
    userId, date: today,
    checkInTime: now,
    status
  });
}

async function checkOut(userId) {
  let today = getDateOnly();
  let record = await Attendance.findOne({ userId, date: today });

  if (!record || !record.checkInTime) {
    throw new ApiError(400, 'You need to check in first');
  }
  if (record.checkOutTime) {
    throw new ApiError(400, 'Already checked out today');
  }

  let now = new Date();
  let hrs = calculateHoursBetween(record.checkInTime, now);
  hrs = Math.round(hrs * 100) / 100;

  if (hrs <= 0) {
    throw new ApiError(400, 'Checkout time must be after check-in time');
  }

  record.checkOutTime = now;
  record.totalHours = hrs;

  // re-check status after we know total hours
  let initialStatus = determineStatus(record.checkInTime);
  let finalStatus = statusAfterCheckout(hrs, initialStatus);

  // pick the "worse" one basically
  if (initialStatus === ATTENDANCE_STATUS.LATE && finalStatus === ATTENDANCE_STATUS.PRESENT) {
    record.status = ATTENDANCE_STATUS.LATE;
  } else {
    record.status = finalStatus;
  }

  await record.save();
  return record;
}

async function getTodayStatus(userId) {
  let today = getDateOnly();
  return Attendance.findOne({ userId, date: today });
}

async function getHistory(userId, query) {
  let { page = 1, limit = 10, startDate, endDate } = query;
  page = parseInt(page);
  limit = parseInt(limit);

  let filter = { userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  let [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
    Attendance.countDocuments(filter)
  ]);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

async function getMonthlySummary(userId, year, month) {
  let startDate = new Date(year, month - 1, 1);
  let endDate = new Date(year, month, 0); // last day of month

  let user = await User.findById(userId).select('createdAt');
  let registeredAt = user ? new Date(user.createdAt) : startDate;

  // effectiveStart = max(createdAt, firstDayOfMonth)
  // effectiveEnd   = min(today, lastDayOfMonth)
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let regDay = new Date(registeredAt.getFullYear(), registeredAt.getMonth(), registeredAt.getDate());

  let effectiveStart = regDay > startDate ? regDay : startDate;
  let effectiveEnd = today < endDate ? today : endDate;

  // month before registration or future month => 0 applicable days
  let applicableDays = effectiveStart > effectiveEnd ? 0 : Math.floor((effectiveEnd - effectiveStart) / 86400000) + 1;

  let records = await Attendance.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  // tally up each status
  let counts = { present: 0, late: 0, halfDay: 0 };
  let totalHrs = 0;

  for (let rec of records) {
    totalHrs += rec.totalHours || 0;
    if (rec.status === ATTENDANCE_STATUS.PRESENT) counts.present++;
    else if (rec.status === ATTENDANCE_STATUS.LATE) counts.late++;
    else if (rec.status === ATTENDANCE_STATUS.HALF_DAY) counts.halfDay++;
  }

  let worked = counts.present + counts.late + counts.halfDay;
  let absentDays = Math.max(0, applicableDays - worked);
  let pct = applicableDays > 0 ? Math.round((worked / applicableDays) * 10000) / 100 : 0;

  return {
    ...counts,
    absent: absentDays,
    totalWorkingHours: Math.round(totalHrs * 100) / 100,
    attendancePercentage: pct,
    records
  };
}

// ==================== MANAGER FUNCTIONS ====================

async function getAllAttendance(query) {
  let { page = 1, limit = 20, startDate, endDate, status, employeeId } = query;
  page = parseInt(page);
  limit = parseInt(limit);

  let filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (status) filter.status = status;

  // filter by specific employee (by userId or employeeId string)
  if (employeeId) {
    let emp = await User.findOne({ employeeId: employeeId.toUpperCase() });
    if (emp) filter.userId = emp._id;
    else return { records: [], total: 0, page, totalPages: 0 };
  }

  let [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('userId', 'name email employeeId department role')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Attendance.countDocuments(filter)
  ]);

  return { records, total, page, totalPages: Math.ceil(total / limit) };
}

async function getEmployeeAttendance(empUserId, query) {
  let { page = 1, limit = 20, startDate, endDate } = query;
  page = parseInt(page);
  limit = parseInt(limit);

  let filter = { userId: empUserId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  let [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Attendance.countDocuments(filter)
  ]);

  return { records, total, page, totalPages: Math.ceil(total / limit) };
}

async function getTeamSummary(query) {
  let { year, month } = query;
  let yr = parseInt(year) || new Date().getFullYear();
  let mo = parseInt(month) || new Date().getMonth() + 1;

  let startDate = new Date(yr, mo - 1, 1);
  let endDate = new Date(yr, mo, 0);

  let employees = await User.find({ role: ROLES.EMPLOYEE }).select('name email employeeId department createdAt');

  let records = await Attendance.find({
    date: { $gte: startDate, $lte: endDate }
  });

  // build a lookup: userId -> array of records
  let recordMap = {};
  for (let rec of records) {
    let uid = rec.userId.toString();
    if (!recordMap[uid]) recordMap[uid] = [];
    recordMap[uid].push(rec);
  }

  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today

  let summary = employees.map(emp => {
    let empRecs = recordMap[emp._id.toString()] || [];
    let counts = { present: 0, late: 0, halfDay: 0 };
    let totalHrs = 0;

    for (let r of empRecs) {
      totalHrs += r.totalHours || 0;
      if (r.status === ATTENDANCE_STATUS.PRESENT) counts.present++;
      else if (r.status === ATTENDANCE_STATUS.LATE) counts.late++;
      else if (r.status === ATTENDANCE_STATUS.HALF_DAY) counts.halfDay++;
    }

    // effectiveStart = max(user.createdAt, firstDayOfMonth)
    // effectiveEnd   = min(today, lastDayOfMonth)
    let reg = new Date(emp.createdAt);
    let regDay = new Date(reg.getFullYear(), reg.getMonth(), reg.getDate());
    let effStart = regDay > startDate ? regDay : startDate;
    let effEnd = today < endDate ? today : endDate;

    // if month is before registration or in the future => 0 applicable days
    let applicable = effStart > effEnd ? 0 : Math.floor((effEnd - effStart) / 86400000) + 1;
    let worked = counts.present + counts.late + counts.halfDay;

    return {
      employee: { _id: emp._id, name: emp.name, email: emp.email, employeeId: emp.employeeId, department: emp.department },
      ...counts,
      absent: Math.max(0, applicable - worked),
      totalHours: Math.round(totalHrs * 100) / 100,
      attendancePercentage: applicable > 0 ? Math.round((worked / applicable) * 10000) / 100 : 0
    };
  });

  return { year: yr, month: mo, summary };
}

async function exportAttendance(query) {
  let { startDate, endDate, employeeId } = query;

  let filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (employeeId && employeeId !== 'all') {
    let emp = await User.findOne({ employeeId: employeeId.toUpperCase() });
    if (emp) filter.userId = emp._id;
  } else {
    // exclude manager records from export
    let empUsers = await User.find({ role: ROLES.EMPLOYEE }).select('_id');
    filter.userId = { $in: empUsers.map(u => u._id) };
  }

  let records = await Attendance.find(filter)
    .populate('userId', 'name employeeId department')
    .sort({ date: -1 });

  // build CSV
  let header = 'Employee Name,Employee ID,Department,Date,Check In,Check Out,Total Hours,Status';
  let rows = records.map(rec => {
    let u = rec.userId || {};
    // use local date to avoid UTC timezone shift
    let dateObj = rec.date ? new Date(rec.date) : null;
    let d = dateObj ? `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}` : '';
    let cin = rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    let cout = rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    return `"${u.name || ''}","${u.employeeId || ''}","${u.department || ''}","${d}","${cin}","${cout}",${rec.totalHours || 0},"${rec.status}"`;
  });

  return [header, ...rows].join('\n');
}

async function getTodayAllStatus() {
  let today = getDateOnly();

  let [employees, records] = await Promise.all([
    User.find({ role: ROLES.EMPLOYEE }).select('name email employeeId department'),
    Attendance.find({ date: today }).populate('userId', 'name email employeeId department')
  ]);

  let checkedInMap = {};
  for (let rec of records) {
    if (rec.userId) checkedInMap[rec.userId._id.toString()] = rec;
  }

  let present = [], absent = [], late = [];

  for (let emp of employees) {
    let rec = checkedInMap[emp._id.toString()];
    if (!rec) {
      absent.push({ employee: emp, status: ATTENDANCE_STATUS.ABSENT });
    } else if (rec.status === ATTENDANCE_STATUS.LATE) {
      late.push({ employee: emp, record: rec, status: rec.status });
      present.push({ employee: emp, record: rec, status: rec.status });
    } else {
      present.push({ employee: emp, record: rec, status: rec.status });
    }
  }

  return {
    total: employees.length,
    presentCount: present.length,
    absentCount: absent.length,
    lateCount: late.length,
    present, absent, late
  };
}

module.exports = {
  checkIn, checkOut, getTodayStatus,
  getHistory, getMonthlySummary,
  getAllAttendance, getEmployeeAttendance,
  getTeamSummary, exportAttendance, getTodayAllStatus
};
