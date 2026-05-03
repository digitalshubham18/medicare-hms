const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getSalaries, getMySalarySummary, generateSalary, bulkGenerateSalary, creditSalary, updateSalary } = require('../controllers/salaryController');
router.use(protect);
router.get('/',          getSalaries);
router.get('/my-summary', getMySalarySummary);
router.post('/generate', authorize('admin'), generateSalary);
router.post('/bulk',     authorize('admin'), bulkGenerateSalary);
router.put('/:id/credit',authorize('admin'), creditSalary);
router.put('/:id',       authorize('admin'), updateSalary);
module.exports = router;


