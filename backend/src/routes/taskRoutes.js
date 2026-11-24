const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.get('/export/csv', exportTasksCsv); // must be above "/:id"
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id/status', updateTaskStatus); // the ONLY way to change status
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
