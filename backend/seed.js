require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Counter = require('./models/Counter');
const Attendance = require('./models/Attendance');
const { ATTENDANCE_STATUS, DEPARTMENTS } = require('./config/constants');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  // wipe existing data
  await User.deleteMany({});
  await Attendance.deleteMany({});
  await Counter.deleteMany({});

  // reset the employee ID counter
  await Counter.findOneAndUpdate(
    { _id: 'employeeId' },
    { seq: 0 },
    { upsert: true }
  );

  async function nextEmpId() {
    let seq = await Counter.getNextSequence('employeeId');
    return 'EMP' + String(seq).padStart(4, '0');
  }

  // create 2 employees
  let empData = [
    { name: 'Nikhil Kumar Chauhan', email: 'nikhil@company.com', password: 'password123', department: DEPARTMENTS[1], role: 'employee' },
    { name: 'Altaf Hussain', email: 'altaf@company.com', password: 'password123', department: DEPARTMENTS[0], role: 'employee' }
  ];

  for (let ed of empData) {
    ed.employeeId = await nextEmpId();
  }

  let employees = await User.create(empData);

  // create 1 manager
  let mgrId = await nextEmpId();
  await User.create({
    name: 'Admin Manager', email: 'manager@company.com',
    password: 'password123', department: DEPARTMENTS[3],
    role: 'manager', employeeId: mgrId
  });

  // generate realistic attendance for current month up to today
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let today = now.getDate();

  // pre-defined patterns for variation
  // 0=absent, 1=present on time, 2=late, 3=half-day
  let patterns = [
    [1, 1, 2, 1, 1, 1, 0, 1, 2, 1, 1, 1, 3, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1],
    [1, 2, 1, 1, 0, 1, 1, 1, 1, 3, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 3, 1]
  ];

  for (let ei = 0; ei < employees.length; ei++) {
    let emp = employees[ei];
    let pat = patterns[ei];

    for (let day = 1; day <= today; day++) {
      let dateObj = new Date(year, month, day);
      let dayOfWeek = dateObj.getDay();

      // skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      let type = pat[(day - 1) % pat.length];

      // absent — skip creating record
      if (type === 0) continue;

      let checkIn = new Date(dateObj);
      let status;
      let totalHours = 0;
      let checkOut = null;

      if (type === 1) {
        // on time: 8:45-9:10 random
        let mins = 45 + Math.floor(Math.random() * 25);
        checkIn.setHours(8, mins, 0, 0);
        status = ATTENDANCE_STATUS.PRESENT;
        totalHours = 7 + Math.random() * 2; // 7-9 hours
      } else if (type === 2) {
        // late: 9:20-10:00 random
        let mins = 20 + Math.floor(Math.random() * 40);
        checkIn.setHours(9, mins, 0, 0);
        status = ATTENDANCE_STATUS.LATE;
        totalHours = 6 + Math.random() * 2; // 6-8 hours
      } else if (type === 3) {
        // half-day: arrives normal but leaves early
        checkIn.setHours(9, Math.floor(Math.random() * 10), 0, 0);
        status = ATTENDANCE_STATUS.HALF_DAY;
        totalHours = 4 + Math.random(); // 4-5 hours
      }

      totalHours = Math.round(totalHours * 100) / 100;

      // don't add checkout for today (simulate in-progress)
      if (day < today) {
        checkOut = new Date(checkIn.getTime() + totalHours * 3600000);
      } else {
        totalHours = 0;
      }

      await Attendance.create({
        userId: emp._id,
        date: dateObj,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        status: day < today ? status : determineStatus(checkIn),
        totalHours: day < today ? totalHours : 0
      });
    }
  }

  let totalRecs = await Attendance.countDocuments();
  process.exit(0);
}

// replicate the status determination from service
function determineStatus(checkInTime) {
  let d = new Date(checkInTime);
  let officeStart = new Date(d);
  let hour = parseInt(process.env.OFFICE_START_HOUR) || 9;
  let threshold = parseInt(process.env.LATE_THRESHOLD_MINUTES) || 15;
  officeStart.setHours(hour, threshold, 0, 0);
  return d > officeStart ? 'late' : 'present';
}

seed().catch(() => {
  process.exit(1);
});
