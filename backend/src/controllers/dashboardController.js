const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { overdueCondition } = require('../services/taskService');
const {
  EMPLOYEE_STATUS,
  TASK_STATUS,
  ACTIVE_TASK_STATUSES,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
} = require('../constants');

// Converts aggregate result [{ _id: 'Active', count: 8 }] into { Active: 8 }
const toCountMap = (rows) => rows.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

// GET /api/dashboard
// Every number on the dashboard is calculated here on the server.
const getDashboard = async (req, res) => {
  const [employeeRows, taskRows, overdueCount, workload] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments(overdueCondition()),

    // Employee workload = number of active (Todo + In Progress) tasks per employee
    Employee.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'assignedEmployee',
          as: 'tasks',
          pipeline: [{ $match: { status: { $in: ACTIVE_TASK_STATUSES } } }, { $project: { status: 1 } }],
        },
      },
      {
        $project: {
          employeeId: 1,
          fullName: 1,
          department: 1,
          status: 1,
          activeTasks: { $size: '$tasks' },
          todo: {
            $size: { $filter: { input: '$tasks', cond: { $eq: ['$$this.status', TASK_STATUS.TODO] } } },
          },
          inProgress: {
            $size: { $filter: { input: '$tasks', cond: { $eq: ['$$this.status', TASK_STATUS.IN_PROGRESS] } } },
          },
        },
      },
      { $sort: { activeTasks: -1, fullName: 1 } },
    ]),
  ]);

  const employeeCounts = toCountMap(employeeRows);
  const taskCounts = toCountMap(taskRows);

  res.json({
    success: true,
    data: {
      employees: {
        total: employeeRows.reduce((sum, row) => sum + row.count, 0),
        active: employeeCounts[EMPLOYEE_STATUS.ACTIVE] || 0,
        inactive: employeeCounts[EMPLOYEE_STATUS.INACTIVE] || 0,
        onLeave: employeeCounts[EMPLOYEE_STATUS.ON_LEAVE] || 0,
      },
      tasks: {
        total: taskRows.reduce((sum, row) => sum + row.count, 0),
        todo: taskCounts[TASK_STATUS.TODO] || 0,
        inProgress: taskCounts[TASK_STATUS.IN_PROGRESS] || 0,
        completed: taskCounts[TASK_STATUS.COMPLETED] || 0,
        cancelled: taskCounts[TASK_STATUS.CANCELLED] || 0,
        overdue: overdueCount,
      },
      workload,
      maxActiveTasks: MAX_ACTIVE_TASKS_PER_EMPLOYEE,
    },
  });
};

module.exports = { getDashboard };
