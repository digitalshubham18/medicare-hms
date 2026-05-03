const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLeaves, applyLeave, reviewLeave, cancelLeave, getTodayLeaves,
  getTasks, createTask, updateTask, deleteTask,
} = require('../controllers/leaveTaskController');

router.use(protect);

// ── Leaves ──────────────────────────────────────────────────────────────────
// IMPORTANT: specific paths must come BEFORE parameterised /:id paths
router.get('/leaves/today',          getTodayLeaves);          // must be before /:id
router.get('/leaves',                getLeaves);
router.post('/leaves',               applyLeave);
router.put('/leaves/:id/review',     authorize('admin'), reviewLeave);
router.put('/leaves/:id/cancel',     cancelLeave);             // now works — :id is real ObjectId

// ── Tasks ────────────────────────────────────────────────────────────────────
router.get('/tasks',                 getTasks);
router.post('/tasks',                authorize('admin', 'doctor', 'nurse'), createTask);
router.put('/tasks/:id',             updateTask);
router.delete('/tasks/:id',          authorize('admin'), deleteTask);

module.exports = router;
