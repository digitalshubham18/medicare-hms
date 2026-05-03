const express = require('express');
const router = express.Router();
const {
  getAppointments, createAppointment, updateAppointment,
  deleteAppointment, getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/slots/:doctorId/:date', getAvailableSlots);
router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', authorize('admin'), deleteAppointment);

module.exports = router;