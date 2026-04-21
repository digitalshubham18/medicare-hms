const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, resolveAlert } = require('../controllers/resourceControllers');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id/resolve', authorize('admin', 'doctor', 'nurse'), resolveAlert);

module.exports = router;