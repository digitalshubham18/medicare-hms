const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }
    if (req.query.department) query.department = req.query.department;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodGroup age')
      .populate('doctor', 'name specialization department rating')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      data: appointments
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, department, type, notes, symptoms } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Check slot availability
    const existingAppt = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppt) {
      return res.status(400).json({ success: false, error: 'Time slot not available' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      department,
      type: type || 'Consultation',
      notes: notes || '',
      symptoms: symptoms || []
    });

    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name specialization department');

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new_appointment', {
        appointmentId: appointment._id,
        patient: appointment.patient.name,
        doctor: appointment.doctor.name,
        date,
        timeSlot
      });
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Only doctor/admin can approve
    if (req.body.status === 'confirmed' && !['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Not authorized to confirm appointments' });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('patient', 'name email').populate('doctor', 'name');

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment_updated', {
        appointmentId: appointment._id,
        status: appointment.status,
        patient: appointment.patient.name
      });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get available slots
// @route   GET /api/appointments/slots/:doctorId/:date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    const d = new Date(date);
    const booked = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);
    const available = allSlots.filter(s => !bookedSlots.includes(s));

    res.json({ success: true, data: { available, booked: bookedSlots } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    await appointment.deleteOne();
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};