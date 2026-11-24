const express = require('express');
const {
  getEmployees,
  getEmployeeOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

const router = express.Router();

router.get('/', getEmployees);
router.get('/options', getEmployeeOptions); // must be above "/:id"
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
