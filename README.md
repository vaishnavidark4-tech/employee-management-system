# Employee & Task Management System (MERN)

A web app where a company can manage employees, assign tasks to them and see a dashboard.
Built with **React + Node.js/Express + MongoDB (Mongoose)** for the Roots Media Marketing MERN Stack Developer Intern assignment.

**Submitted by:** Vaishnavi Darkunde

All business rules (assignment, capacity, status flow, dates, overdue, delete rules) are enforced on the **backend**.
The frontend also validates fields for a better user experience, but it never replaces the backend checks.

| | Link |
|---|---|
| Frontend (live) | https://employee-management-app-164s.onrender.com |
| Backend API (live) | https://employee-management-system-95gp.onrender.com/api (health check: [`/api/health`](https://employee-management-system-95gp.onrender.com/api/health)) |
| Database | MongoDB Atlas |

> Hosted on Render's free plan. If the site was not used for a while, the backend sleeps and the **first request can take about 30-50 seconds** to wake up. After that it is fast.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [API Overview](#api-overview)
7. [Database Schema & Employee → Task Relationship](#database-schema--employee--task-relationship)
8. [How Employee Deletion Is Handled](#how-employee-deletion-is-handled)
9. [Business Rules – Where They Are Enforced](#business-rules--where-they-are-enforced)
10. [Assumptions](#assumptions)
11. [Questions & Answers](#questions--answers)
12. [Deployment](#deployment)

---

## Features

**Login** (extra, not required by the assignment)
- Login page with email + password. Passwords are stored as a **bcrypt hash**, never as plain text.
- The backend returns a **JWT token**. Every employee, task and dashboard API checks this token, so the data is protected on the server, not only hidden in the UI.
- Pages are protected routes. After login the user goes back to the page they wanted. The session survives a refresh, and an expired token logs the user out automatically.
- There is no sign-up page. Users are created with a script (see [Local Setup](#local-setup)), so no password is written in the code.

**Dashboard**
- Employee counts (Total / Active / Inactive / On Leave) and task counts (Total / Todo / In Progress / Completed / Cancelled / Overdue). All numbers come from the backend.
- Employee workload table (active tasks per employee with a capacity bar).
- Every card is clickable and opens the list with that filter applied.

**Employees**
- List with server-side search (name, email, employee ID), filters (department, status), sorting and pagination.
- Add / Edit form with field validation. Leave Start / Leave End fields appear only when status is "On Leave".
- View page with profile, skills, workload bar, task statistics and recent tasks.
- Delete is blocked while the employee has Todo / In Progress tasks.

**Tasks**
- List with server-side search (task title, employee name), filters (department, priority, status, overdue, due date range), sorting (created date, due date, priority by importance, title) and pagination.
- All filters, sorting and the page number stay in the URL (e.g. `/tasks?status=In%20Progress&priority=High&page=2`).
- Status dropdown shows only the valid next statuses. Completed and Cancelled ask for confirmation because they are final.
- Export CSV downloads **all** tasks that match the current filters (not only the visible page).
- Add / Edit form shows backend business-rule errors (e.g. "Employee already has 3 active tasks").
- View page with details, overdue alert, assigned employee card and a timeline.

**General**
- Responsive on mobile, tablet and desktop.
- Toast notifications for success and errors, plus loading, empty and error states on every page.
- 404 page for unknown routes and for deleted or invalid records.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router 7, React-Bootstrap 2 / Bootstrap 5, Axios, React-Toastify, React Icons |
| Backend | Node.js, Express 5, Mongoose 9, bcryptjs (password hashing), jsonwebtoken (JWT login) |
| Database | MongoDB (local or MongoDB Atlas) |

---

## Folder Structure

```
EmployeeManagment/
├── backend/
│   ├── server.js                 # starts the server after connecting to MongoDB
│   ├── seed/seed.js              # optional demo data (npm run seed)
│   ├── seed/createUser.js        # creates a login user (npm run create-user)
│   ├── .env.example
│   └── src/
│       ├── app.js                # express app, middlewares, routes
│       ├── config/db.js          # MongoDB connection
│       ├── constants/            # departments, statuses, allowed status transitions, limits
│       ├── models/               # User, Employee, Task, Counter (for TSK-001 style IDs)
│       ├── validators/           # request body validation (employee, task, status)
│       ├── services/taskService.js  # ALL task business rules (assignment, capacity, status flow, overdue, filters)
│       ├── controllers/          # request handlers (auth, employee, task, dashboard)
│       ├── routes/               # API routes
│       ├── middleware/auth.js    # checks the JWT token on protected routes
│       ├── middleware/errorHandler.js  # one place that converts errors to 400/401/404/409/500 JSON
│       └── utils/                # ApiError, JWT token helpers, date helpers, pagination helpers, CSV builder
│
└── frontend/
    ├── .env.example
    ├── public/_redirects         # SPA routing on Netlify (vercel.json does the same for Vercel)
    └── src/
        ├── api/                  # axios client + one file per resource
        ├── components/
        │   ├── common/           # PageHeader, Loader, PaginationBar, ConfirmModal, FormField, StatusBadge, ...
        │   ├── auth/             # ProtectedRoute
        │   ├── layout/           # Navbar (with user menu / logout) + page layout
        │   ├── employees/        # EmployeeForm, EmployeeTable, EmployeeFilters, TaskStatsGrid
        │   ├── tasks/            # TaskForm, TaskTable, TaskFilters, TaskStatusDropdown, DueDateRangeFilter, TaskTimeline
        │   └── dashboard/        # StatCard, WorkloadTable
        ├── context/              # AuthContext (logged-in user, login, logout)
        ├── hooks/                # useUrlFilters (filters <-> URL), useFetch (loading / error state)
        ├── pages/                # one component per route (LoginPage, DashboardPage, employees/, tasks/)
        ├── constants/            # dropdown values, badge colours, sort options
        └── utils/                # date formatting, form validation, file download, token storage
```

---

## Local Setup

**Prerequisites:** Node.js 18+ and MongoDB (local install or a free MongoDB Atlas cluster).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit MONGO_URI and set a JWT_SECRET
npm run seed                # optional: adds 12 employees and 37 tasks (deletes existing data!)
npm run create-user -- --name "Your Name" --email you@example.com --password yourPassword
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Production build: `npm run build` (output in `frontend/dist`).

> `create-user` saves the user with a hashed password. Running it again with the same email updates the name and password.
> The seed data is only a dev/demo helper. The app itself never uses hardcoded data; everything comes from the API.
> Seed dates are calculated from "today", so there are always overdue tasks and employees on leave in the demo.

---

## Environment Variables

### backend/.env

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | Port of the API |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/employee_task_db` | MongoDB connection string (local or Atlas) |
| `CLIENT_URL` | `http://localhost:5173` | Allowed frontend origin(s) for CORS. Separate several with a comma |
| `JWT_SECRET` | long random string | Secret used to sign login tokens. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `1d` | How long a login stays valid |
| `TZ` | `Asia/Kolkata` | Timezone used to decide "today" for the Overdue rule |
| `NODE_ENV` | `development` | `production` hides internal error details |

### frontend/.env

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the backend API |

---

## API Overview

Base URL: `/api`. Every response is JSON in the same format:

```json
// success
{ "success": true, "message": "Task TSK-012 created successfully", "data": { }, "pagination": { "page": 1, "limit": 10, "total": 23, "totalPages": 3 } }

// error
{ "success": false, "message": "Employee already has 3 active tasks. Please choose another employee.", "errors": { "assignedEmployee": "..." } }
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Body `{ "email", "password" }`. Returns `{ token, user }` |
| GET | `/auth/me` | Returns the logged-in user (token required) |

All `/employees`, `/tasks` and `/dashboard` endpoints need the header `Authorization: Bearer <token>`, otherwise they return **401**. `/api/health` is public.

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List with search, filters, sorting and pagination |
| GET | `/employees/options` | Light list for the "Assigned Employee" dropdown (with active task count) |
| GET | `/employees/:id` | One employee + task statistics |
| POST | `/employees` | Create employee |
| PUT | `/employees/:id` | Update employee (also updates the employee details saved in their tasks) |
| DELETE | `/employees/:id` | Delete (blocked if the employee has Todo / In Progress tasks) |

Query params for `GET /employees`: `search`, `department`, `status`, `sortBy` (`createdAt` / `fullName` / `employeeId` / `joiningDate`), `order` (`asc` / `desc`), `page`, `limit` (max 100).

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List with search, filters, sorting and pagination |
| GET | `/tasks/:id` | One task |
| POST | `/tasks` | Create task (always starts as `Todo`) |
| PUT | `/tasks/:id` | Edit task details. **Ignores `status` and `completedDate`**. Rejected for Completed / Cancelled tasks |
| PUT | `/tasks/:id/status` | **The only way to change status.** Body: `{ "status": "In Progress" }` |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/tasks/export/csv` | Download CSV of **all** tasks matching the same filters as `GET /tasks` |

Query params for `GET /tasks` and the CSV export:

| Param | Example | Notes |
|---|---|---|
| `search` | `payment` | Matches task title, employee name or task ID (case-insensitive) |
| `department` | `Development` | |
| `priority` | `High` | |
| `status` | `In Progress` | Also accepts `Overdue` (calculated, see the rules below) |
| `dueFrom`, `dueTo` | `2026-11-01` | Due date range, both inclusive |
| `employee` | `<employee _id>` | Tasks of one employee |
| `sortBy` | `createdAt` / `dueDate` / `priority` / `title` | `priority` sorts by importance (Low < Medium < High < Critical) |
| `order` | `asc` / `desc` | |
| `page`, `limit` | `2`, `10` | |

All filters work together (AND).

Every task in a response also has calculated fields: `isOverdue`, `nextStatuses` (valid next statuses) and `isEditable`.

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Employee counts, task counts (with overdue) and employee workload, all calculated with MongoDB aggregation |

### Status codes

| Code | When |
|---|---|
| 200 / 201 | Success / created |
| 400 | Invalid data or a broken business rule (validation, inactive employee, leave clash, capacity, wrong status change, editing a closed task, deleting an employee with active tasks, invalid filters) |
| 401 | Not logged in, invalid / expired token, or wrong email / password |
| 404 | Employee / task / route not found (also for invalid ids) |
| 409 | Duplicate Employee ID or email |
| 500 | Unexpected server error |

---

## Database Schema & Employee → Task Relationship

### Employee

| Field | Type | Rules |
|---|---|---|
| `employeeId` | String | Required, **unique**, uppercase, 3-20 characters (A-Z, 0-9, -) |
| `fullName` | String | Required, 2-60 characters |
| `email` | String | Required, **unique**, normalized (trimmed + lowercase) |
| `phone` | String | Required, 10-digit mobile number |
| `department` | String | Development / Design / QA / HR / Sales |
| `role` | String | Required, 2-50 characters |
| `joiningDate` | Date | Required |
| `status` | String | Active / Inactive / On Leave (default Active) |
| `skills` | [String] | Optional, max 20, duplicates removed |
| `leaveStart`, `leaveEnd` | Date | Required **only** when status is On Leave (`leaveEnd >= leaveStart`), otherwise saved as `null` |
| `createdAt`, `updatedAt` | Date | Automatic |

### Task

| Field | Type | Rules |
|---|---|---|
| `taskId` | String | Auto generated, unique: `TSK-001`, `TSK-002`, ... |
| `title` | String | Required, 3-100 characters |
| `description` | String | Optional, max 1000 characters |
| `assignedEmployee` | ObjectId → Employee | Required |
| `employeeSnapshot` | Object | `{ employeeId, fullName, email, department }` copied from the employee |
| `employeeDeleted` | Boolean | `true` after the employee is deleted |
| `department` | String | Development / Design / QA / HR / Sales |
| `priority` | String | Low / Medium / High / Critical |
| `priorityRank` | Number | 1-4, set automatically from priority (used for "sort by importance") |
| `status` | String | Todo / In Progress / Completed / Cancelled (default Todo) |
| `startDate`, `dueDate` | Date | Required, `dueDate >= startDate` |
| `completedDate` | Date | Set **only by the backend** when status becomes Completed |
| `createdAt` | Date | Automatic = "Created Date" |

### User

| Field | Type | Rules |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, **unique**, lowercase |
| `password` | String | bcrypt hash, min 6 characters before hashing, never returned by the API (`select: false`) |

### Counter

`{ _id: "task", seq: Number }`. It is used to generate task IDs. `findOneAndUpdate` with `$inc` is atomic, so two tasks created at the same time never get the same ID.

### Relationship

**One employee → many tasks** (one-to-many). Each task stores a reference (`assignedEmployee`) to the employee and a **snapshot** of the employee's main details.

- The reference is used for the rules (capacity count, delete check, employee filter, workload).
- The snapshot is used for display, search by employee name and CSV, so a task still shows who it belonged to even if the employee is deleted later.
- When an employee is edited (for example a name change), the snapshot in all of their tasks is updated too.

Indexes exist on the fields used for filtering and sorting (`assignedEmployee + status`, `status + dueDate`, `department + priority`, `createdAt`, `priorityRank`).

---

## How Employee Deletion Is Handled

1. `DELETE /api/employees/:id` first counts the employee's tasks with status **Todo or In Progress**.
2. If there is at least one, the delete is rejected with **400** and a clear message ("…still have 2 active task(s)… Please complete, cancel or reassign them first.").
3. Otherwise the employee document is deleted and all of their old tasks (Completed / Cancelled) are marked `employeeDeleted: true`.
4. Old tasks keep the `employeeSnapshot` (ID, name, email, department), so the task list, task details page and CSV still show meaningful employee details, with a "(deleted)" label in the UI.

---

## Business Rules – Where They Are Enforced

| Rule | Backend (source of truth) | Frontend (user experience only) |
|---|---|---|
| Only Active employee; Inactive always rejected; On Leave rejected if the start date is inside the leave period (inclusive) | `services/taskService.js` → `checkEmployeeCanTakeTask` | Inactive employees are disabled in the dropdown, a leave hint is shown |
| Max 3 active (Todo + In Progress) tasks per employee | `checkEmployeeCanTakeTask` (counts in MongoDB) | Shows "x/3 tasks" next to each employee |
| Due date ≥ start date | `validators/taskValidator.js` | Same check in `utils/validation.js` + `min` on the date input |
| Status flow Todo → In Progress → Completed, Todo/In Progress → Cancelled | `constants.STATUS_TRANSITIONS` + `checkStatusTransition`, only in `PUT /tasks/:id/status` | Dropdown shows only `task.nextStatuses` sent by the backend |
| New tasks start as Todo; status not editable through the normal update | Create always sets `Todo`; the validator never reads `status` / `completedDate` from the body | The form has no status field |
| Completed / Cancelled tasks can't be edited | `updateTask` controller | Edit is disabled in the menu and on the edit page |
| Completed Date set by the backend | `updateTaskStatus` sets `completedDate = new Date()` | Never sent by the frontend |
| Overdue | `overdueCondition()` / `isTaskOverdue()` in one service, used by the list, details, dashboard, CSV and the "Overdue" filter | Only displays `task.isOverdue` |
| Can't delete an employee with active tasks | `deleteEmployee` controller | Shows the server message in a toast |
| Unique employee ID / email (409) | Pre-check in the controller + unique indexes (error handler converts code 11000 to 409) | Shows the field error |

---

## Assumptions

- **Dates are "date only".** Start, due, joining and leave dates are saved as `YYYY-MM-DD` at 00:00 UTC to avoid timezone problems. "Today" for the Overdue rule uses the server timezone (`TZ`, default `Asia/Kolkata`).
- **Overdue** means today is **later** than the due date, so a task due today is not overdue yet. Completed and Cancelled tasks are never overdue.
- **Task department** is its own field (as in the design). It is auto-filled from the selected employee, but the user can change it.
- **Assignment rules on edit** are checked again only when the assigned employee or the start date changes. So if an employee becomes Inactive later, their existing tasks can still be updated (for example renamed) or moved through the status flow. They just can't get new tasks.
- Changing an employee's status (Inactive / On Leave) does not change their existing tasks automatically.
- A task can be deleted in any status (hard delete). Employees with active tasks can't be deleted (see above).
- Start date can be in the past (for example to log work that already started).
- Phone numbers are 10-digit Indian mobile numbers (start with 6-9). Employee ID is 3-20 characters of letters, numbers or `-`.
- Task search by employee name uses the saved snapshot, so tasks of deleted employees are still searchable.
- Login was not required by the assignment. I added it as an extra with a single admin-style user and no sign-up page. Every logged-in user can do everything (no roles).

---

## Questions & Answers

### 1. Where do you validate status transitions and why?

On the **backend**, in `PUT /api/tasks/:id/status`. The allowed transitions are defined once in `constants/index.js` (`STATUS_TRANSITIONS`) and checked by `checkStatusTransition()` in `services/taskService.js`. Any other change (for example Todo → Completed, or anything from Completed / Cancelled) returns **400**.
The normal `PUT /api/tasks/:id` ignores the `status` field completely, so status can't be changed by another route.

Why: the frontend can be skipped easily (Postman, curl, browser dev tools), so a rule that only exists in React is not a real rule. The backend is the only place every request must pass through. The frontend just shows the valid options (`nextStatuses` comes from the backend), so the user doesn't even see invalid choices.

### 2. Why does Completed Date come from the backend?

Because it is a **fact recorded by the system**, not user input. If the frontend sent it, a user could send a wrong date (past, future, or a different timezone/clock), and reports and CSV data would not be reliable. The backend sets `completedDate = new Date()` at the exact moment the status changes to Completed, using the server clock. Any `completedDate` sent by the client is ignored.

### 3. How do you block inactive / on-leave assignment?

In `checkEmployeeCanTakeTask()` (`services/taskService.js`), which runs on task create and on task edit when the employee or start date changes:
1. Load the employee from the database (never trusting status sent by the client). Not found → 400.
2. `Inactive` → always 400.
3. `On Leave` → 400 only if `leaveStart <= task.startDate <= leaveEnd` (both inclusive). If the task starts outside the leave period, it is allowed.
4. Then the capacity check (max 3 active tasks).

The frontend disables Inactive employees in the dropdown and shows the leave period as a hint, but that's only for convenience. The backend makes the decision and its message is shown in the form.

### 4. Why are filtering and pagination on the backend?

- **Performance:** the database returns only one page (e.g. 10 rows) instead of every record. This stays fast when there are thousands of tasks, and MongoDB can use indexes.
- **Correctness:** counts like "Showing 1-10 of 230" and the total pages are correct for the whole data set, not just the rows that were loaded.
- **Consistency:** the same filter code (`buildTaskQuery`) is used by the list and the CSV export, so the export always matches what the user filtered.
- **Less data over the network**, which matters on mobile.

### 5. Why do filters live in the URL?

- Refreshing the page keeps the same view (search, filters, sort, page).
- A URL like `/tasks?status=In%20Progress&priority=High&page=2` can be copied and shared, and the other person sees exactly the same list.
- The browser back / forward buttons work naturally between filter changes.
- The URL is the single source of truth: the `useUrlFilters` hook reads the filters from the URL and the page loads data whenever the URL changes, so the UI and the data never get out of sync. It also lets the dashboard cards link straight to filtered lists (e.g. `/tasks?status=Overdue`).

### 6. What can go wrong if two requests assign a 4th active task at the same time?

This is a **race condition** (check-then-act). The capacity check works in two steps: (1) count active tasks, (2) insert the task. If an employee has 2 active tasks and two requests arrive at almost the same time:

1. Request A counts 2 → OK
2. Request B counts 2 → OK (A has not saved yet)
3. A inserts → 3 active
4. B inserts → **4 active**, so the rule is broken

Each request is correct on its own, but together they break the limit. In my current code this is possible in theory (the window is a few milliseconds), which I think is acceptable for an assignment of this size. In a real production system I would fix it in one of these ways:
- **Atomic counter on the employee:** keep `activeTaskCount` on the employee and "reserve a slot" with a single atomic update, `Employee.findOneAndUpdate({ _id, activeTaskCount: { $lt: 3 } }, { $inc: { activeTaskCount: 1 } })`. If it returns `null`, the employee is full. Decrease it when a task is completed, cancelled, deleted or reassigned.
- **MongoDB transaction** (needs a replica set, which Atlas has): do the count and the insert in one transaction that also writes to the employee document, so two parallel transactions conflict and one of them is retried or rejected.
- A lock / queue per employee, so requests for the same employee are processed one by one.

---

## Deployment

The live version is deployed for free on **MongoDB Atlas + Render**:

1. **Database – MongoDB Atlas:** free cluster, a database user, network access `0.0.0.0/0` (so Render can connect) and the connection string with the database name `employee_task_db`. Demo data was added with `npm run seed`.
2. **Backend – Render Web Service:**
   - Root directory: `backend`, build command: `npm install`, start command: `npm start`, health check path: `/api/health`
   - Environment: `MONGO_URI=<atlas uri>`, `CLIENT_URL=<frontend url>`, `JWT_SECRET=<long random string>`, `TZ=Asia/Kolkata`, `NODE_ENV=production`
   - The login user was created once with `npm run create-user` (pointing `MONGO_URI` to Atlas)
3. **Frontend – Render Static Site:**
   - Root directory: `frontend`, build command: `npm install && npm run build`, publish directory: `dist`
   - Environment: `VITE_API_URL=<backend url>/api`
   - Rewrite rule `/*` → `/index.html`, so refreshing routes like `/tasks/123` works (React Router handles them).
   - The project also works on Netlify (`public/_redirects`) and Vercel (`vercel.json`).

> Note: on Render's free plan the backend sleeps when unused, so the first request can take around 30-50 seconds.
