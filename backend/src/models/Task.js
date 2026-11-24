const mongoose = require('mongoose');
const { DEPARTMENTS, TASK_STATUS, TASK_PRIORITIES, PRIORITY_RANK } = require('../constants');

// Copy of the employee details at the time of assignment.
// It is kept inside the task so that old tasks still show who worked on them,
// even if the employee is deleted later.
const employeeSnapshotSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true, // auto generated, e.g. TSK-001
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title can not be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description can not be more than 1000 characters'],
      default: '',
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned employee is required'],
    },
    employeeSnapshot: {
      type: employeeSnapshotSchema,
      required: true,
    },
    employeeDeleted: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: { values: DEPARTMENTS, message: 'Invalid department' },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: { values: TASK_PRIORITIES, message: 'Invalid priority' },
    },
    // Number version of priority (Low=1 ... Critical=4) so we can sort by importance
    priorityRank: {
      type: Number,
    },
    status: {
      type: String,
      enum: { values: Object.values(TASK_STATUS), message: 'Invalid status' },
      default: TASK_STATUS.TODO,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    // Set only by the backend when status becomes Completed
    completedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // createdAt = Created Date
);

// Keep priorityRank in sync with priority before every save
taskSchema.pre('validate', function setPriorityRank() {
  if (this.priority) this.priorityRank = PRIORITY_RANK[this.priority];
});

// Indexes for the fields we search, filter and sort on
taskSchema.index({ assignedEmployee: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ department: 1, priority: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ priorityRank: -1 });

module.exports = mongoose.model('Task', taskSchema);
