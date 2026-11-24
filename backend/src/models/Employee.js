const mongoose = require('mongoose');
const { DEPARTMENTS, EMPLOYEE_STATUS } = require('../constants');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]{3,20}$/, 'Employee ID must be 3-20 characters (letters, numbers, -)'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [60, 'Full name can not be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // normalized, so "Rahul@Mail.com" and "rahul@mail.com" are the same
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Phone must be a valid 10 digit mobile number'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: { values: DEPARTMENTS, message: 'Invalid department' },
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [50, 'Role can not be more than 50 characters'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    status: {
      type: String,
      enum: { values: Object.values(EMPLOYEE_STATUS), message: 'Invalid status' },
      default: EMPLOYEE_STATUS.ACTIVE,
    },
    skills: {
      type: [String],
      default: [],
    },
    // Leave dates are only stored when status is "On Leave"
    leaveStart: { type: Date, default: null },
    leaveEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 1 });
employeeSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
