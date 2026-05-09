const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, DEPARTMENTS } = require('../config/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // don't return password by default
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.EMPLOYEE
  },
  employeeId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
    // auto-generated during registration via Counter model
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: DEPARTMENTS
  }
}, { timestamps: true });

// hash pw before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// clean up json output
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
