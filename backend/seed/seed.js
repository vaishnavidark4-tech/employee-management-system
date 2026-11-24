/**
 * Seed script - fills the database with sample data for demo / testing.
 * Run: npm run seed
 *
 * WARNING: it deletes all existing employees and tasks first.
 * Dates are calculated relative to today, so there are always some overdue tasks
 * and employees on leave when you run it.
 */
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Employee = require('../src/models/Employee');
const Task = require('../src/models/Task');
const Counter = require('../src/models/Counter');
const { getToday } = require('../src/utils/dateUtils');

const DAY = 24 * 60 * 60 * 1000;
const daysFromToday = (days) => new Date(getToday().getTime() + days * DAY);

const employees = [
  { employeeId: 'EMP001', fullName: 'Rahul Sharma', department: 'Development', role: 'Senior Developer', status: 'Active', skills: ['Node.js', 'MongoDB', 'React'], joined: -900 },
  { employeeId: 'EMP002', fullName: 'Priya Patil', department: 'Design', role: 'UI/UX Designer', status: 'Active', skills: ['Figma', 'Adobe XD'], joined: -700 },
  { employeeId: 'EMP003', fullName: 'Amit Joshi', department: 'QA', role: 'QA Engineer', status: 'Active', skills: ['Manual Testing', 'Postman'], joined: -500 },
  { employeeId: 'EMP004', fullName: 'Sneha Kulkarni', department: 'HR', role: 'HR Executive', status: 'Active', skills: ['Recruitment', 'Onboarding'], joined: -650 },
  { employeeId: 'EMP005', fullName: 'Rohan Deshmukh', department: 'Sales', role: 'Sales Manager', status: 'Active', skills: ['Negotiation', 'CRM'], joined: -1100 },
  { employeeId: 'EMP006', fullName: 'Pooja Shinde', department: 'Development', role: 'Frontend Developer', status: 'Active', skills: ['React', 'CSS', 'Bootstrap'], joined: -300 },
  { employeeId: 'EMP007', fullName: 'Karan Mehta', department: 'Development', role: 'Backend Developer', status: 'Active', skills: ['Express', 'MongoDB'], joined: -420 },
  { employeeId: 'EMP008', fullName: 'Anjali Pawar', department: 'QA', role: 'Automation Tester', status: 'Active', skills: ['Selenium', 'Cypress'], joined: -250 },
  { employeeId: 'EMP009', fullName: 'Vikas Jadhav', department: 'Sales', role: 'Sales Executive', status: 'Inactive', skills: ['Cold Calling'], joined: -800 },
  { employeeId: 'EMP010', fullName: 'Neha Gupta', department: 'Design', role: 'Graphic Designer', status: 'Inactive', skills: ['Photoshop', 'Illustrator'], joined: -600 },
  { employeeId: 'EMP011', fullName: 'Siddharth Rao', department: 'Development', role: 'DevOps Engineer', status: 'On Leave', skills: ['Docker', 'AWS'], joined: -550, leave: [-2, 5] },
  { employeeId: 'EMP012', fullName: 'Meera Iyer', department: 'HR', role: 'Recruiter', status: 'On Leave', skills: ['Screening', 'LinkedIn'], joined: -200, leave: [3, 10] },
];

// This employee "was deleted" - only their old tasks remain (shows how deleted employees are handled)
const deletedEmployee = {
  _id: new mongoose.Types.ObjectId(),
  employeeId: 'EMP013',
  fullName: 'Arjun Nair',
  email: 'arjun.nair@example.com',
  department: 'Development',
};

// [title, employee index (or 'deleted'), priority, status, startDay, dueDay, completedDay]
const tasks = [
  ['Fix payment API bug', 0, 'High', 'In Progress', -10, -2],
  ['Setup CI pipeline', 0, 'High', 'Todo', 1, 8],
  ['Optimize database queries', 0, 'Medium', 'Todo', 0, 6],
  ['Implement login API', 0, 'High', 'Completed', -30, -20, -21],
  ['Design login screen', 1, 'Medium', 'In Progress', -5, 3],
  ['Update landing page', 1, 'Critical', 'Todo', 2, 9],
  ['Create style guide', 1, 'Low', 'Completed', -25, -15, -16],
  ['Redesign old banner', 1, 'Low', 'Cancelled', -20, -10],
  ['Write test cases for checkout', 2, 'Low', 'In Progress', -3, 4],
  ['Regression testing v1.2', 2, 'High', 'Completed', -15, -8, -9],
  ['Smoke test release build', 2, 'Medium', 'Completed', -7, -5, -5],
  ['Plan onboarding for new joiners', 3, 'Medium', 'Todo', -1, 6],
  ['Update leave policy document', 3, 'Low', 'In Progress', -8, -1],
  ['Organize team outing', 3, 'Low', 'Completed', -20, -12, -13],
  ['Prepare Q4 sales report', 4, 'High', 'In Progress', -6, -3],
  ['Client demo for ABC Corp', 4, 'Critical', 'Todo', 0, 2],
  ['Follow up with new leads', 4, 'Medium', 'Todo', 1, 5],
  ['Update CRM records', 4, 'Low', 'Completed', -12, -6, -7],
  ['Build dashboard UI', 5, 'High', 'In Progress', -4, 5],
  ['Fix responsive issues on mobile', 5, 'Medium', 'Todo', -2, -1],
  ['Create reusable button component', 5, 'Low', 'Completed', -18, -14, -14],
  ['Migrate to old UI kit', 5, 'Low', 'Cancelled', -16, -9],
  ['Create export CSV API', 6, 'High', 'In Progress', -3, 2],
  ['Add pagination to tasks API', 6, 'Medium', 'Todo', 1, 7],
  ['Setup MongoDB indexes', 6, 'Medium', 'Completed', -14, -10, -11],
  ['Automate login tests', 7, 'High', 'Todo', 0, 10],
  ['Write API test suite', 7, 'High', 'Completed', -22, -12, -12],
  ['Bug bash for release', 7, 'Medium', 'Completed', -9, -6, -6],
  ['Cold calling campaign', 8, 'Medium', 'Completed', -40, -30, -31],
  ['Trade fair preparation', 8, 'Low', 'Cancelled', -35, -25],
  ['Social media creatives', 9, 'Medium', 'Completed', -45, -38, -38],
  ['Monitor server logs', 10, 'Medium', 'In Progress', -12, -4],
  ['Docker setup for backend', 10, 'High', 'Completed', -30, -20, -22],
  ['Shortlist resumes for QA role', 11, 'Medium', 'Todo', -1, 2],
  ['Conduct HR interviews', 11, 'Medium', 'Completed', -10, -5, -5],
  ['Legacy code cleanup', 'deleted', 'Low', 'Completed', -60, -50, -52],
  ['Write API documentation', 'deleted', 'Medium', 'Completed', -55, -45, -46],
];

const buildEmail = (fullName) => `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

const seed = async () => {
  await connectDB(process.env.MONGO_URI);

  await Promise.all([Employee.deleteMany({}), Task.deleteMany({}), Counter.deleteMany({})]);
  console.log('Old data removed');

  const createdEmployees = await Employee.insertMany(
    employees.map((emp, index) => ({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: buildEmail(emp.fullName),
      phone: `98765${String(43210 + index).padStart(5, '0')}`,
      department: emp.department,
      role: emp.role,
      joiningDate: daysFromToday(emp.joined),
      status: emp.status,
      skills: emp.skills,
      leaveStart: emp.leave ? daysFromToday(emp.leave[0]) : null,
      leaveEnd: emp.leave ? daysFromToday(emp.leave[1]) : null,
    }))
  );
  console.log(`${createdEmployees.length} employees added`);

  // Oldest task first, so Task IDs follow the created date
  const sortedTasks = [...tasks].sort((a, b) => a[4] - b[4]);

  const taskDocs = sortedTasks.map(([title, empIndex, priority, status, startDay, dueDay, completedDay], index) => {
    const isDeleted = empIndex === 'deleted';
    const employee = isDeleted ? deletedEmployee : createdEmployees[empIndex];

    return {
      taskId: `TSK-${String(index + 1).padStart(3, '0')}`,
      title,
      description: `${title} - sample task created by the seed script.`,
      assignedEmployee: employee._id,
      employeeSnapshot: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
      },
      employeeDeleted: isDeleted,
      department: employee.department,
      priority,
      status,
      startDate: daysFromToday(startDay),
      dueDate: daysFromToday(dueDay),
      completedDate: completedDay !== undefined ? daysFromToday(completedDay) : null,
      createdAt: daysFromToday(startDay - 1),
    };
  });

  await Task.insertMany(taskDocs);
  await Counter.create({ _id: 'task', seq: taskDocs.length });
  console.log(`${taskDocs.length} tasks added`);

  await mongoose.disconnect();
  console.log('Seeding finished');
};

seed().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
