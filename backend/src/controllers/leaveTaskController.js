const Leave = require('../models/Leave');
const Task  = require('../models/Task');
const User  = require('../models/User');

// ── LEAVES ────────────────────────────────────────────────────────────────────
exports.getLeaves = async (req, res) => {
  try {
    const q = {};
    if (req.user.role !== 'admin') q.user = req.user.id;
    else if (req.query.userId) q.user = req.query.userId;
    if (req.query.status) q.status = req.query.status;
    const leaves = await Leave.find(q)
      .populate('user', 'name role department email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, user: req.user.id });
    await leave.populate('user', 'name role department');
    const io = req.app.get('io');
    if (io) io.to('admin_room').emit('leave_applied', {
      userId: req.user.id, userName: req.user.name,
      type: req.body.type, from: req.body.from, to: req.body.to,
    });
    res.status(201).json({ success: true, data: leave });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.reviewLeave = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Admin only' });
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, reviewedBy: req.user.id, reviewedAt: new Date(), remarks: req.body.remarks || '' },
      { new: true }
    ).populate('user', 'name role');
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });
    const io = req.app.get('io');
    if (io) io.to(`user_${leave.user._id}`).emit('leave_reviewed', {
      status: leave.status, type: leave.type, from: leave.from, to: leave.to,
      userName: leave.user.name, remarks: leave.remarks,
    });
    res.json({ success: true, data: leave });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, error: 'Leave not found' });

    // Only the owner or admin can cancel
    if (leave.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Not authorised to cancel this leave' });

    // Cannot cancel already-cancelled or rejected leaves
    if (leave.status === 'cancelled')
      return res.status(400).json({ success: false, error: 'Leave is already cancelled' });
    if (leave.status === 'rejected')
      return res.status(400).json({ success: false, error: 'Rejected leaves cannot be cancelled' });

    leave.status = 'cancelled';
    await leave.save();
    res.json({ success: true, data: leave });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getTodayLeaves = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const leaves   = await Leave.find({
      status: 'approved',
      from:   { $lte: tomorrow },
      to:     { $gte: today },
    }).populate('user', 'name role department');
    res.json({ success: true, data: leaves });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// ── TASKS ─────────────────────────────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const q = {};
    // Non-admins only see their own assigned tasks
    if (req.user.role !== 'admin') {
      q.assignedTo = req.user.id;
    } else {
      if (req.query.assignedTo) q.assignedTo = req.query.assignedTo;
    }
    if (req.query.status)   q.status   = req.query.status;
    if (req.query.priority) q.priority = req.query.priority;
    if (req.query.category) q.category = req.query.category;

    const tasks = await Task.find(q)
      .populate('assignedTo', 'name role department')
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user.id });
    await task.populate('assignedTo', 'name role');
    await task.populate('assignedBy', 'name role');
    // Notify assigned staff via socket
    const io = req.app.get('io');
    if (io && task.assignedTo?._id) {
      io.to(`user_${task.assignedTo._id}`).emit('task_assigned', {
        taskId: task._id, title: task.title,
        assignedBy: req.user.name, priority: task.priority, dueDate: task.dueDate,
      });
    }
    res.status(201).json({ success: true, data: task });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    // Non-admin staff can only update status/notes on their own tasks
    if (req.user.role !== 'admin') {
      if (task.assignedTo.toString() !== req.user.id)
        return res.status(403).json({ success: false, error: 'Not authorised' });
      const allowed = {};
      if (req.body.status) allowed.status = req.body.status;
      if (req.body.notes)  allowed.notes  = req.body.notes;
      if (req.body.status === 'completed') allowed.completedAt = new Date();
      const updated = await Task.findByIdAndUpdate(req.params.id, allowed, { new: true })
        .populate('assignedTo', 'name role').populate('assignedBy', 'name role');
      return res.json({ success: true, data: updated });
    }

    const update = { ...req.body };
    if (update.status === 'completed') update.completedAt = new Date();
    const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignedTo', 'name role').populate('assignedBy', 'name role');
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Admin only' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
