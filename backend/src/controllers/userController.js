const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.status) query.status = req.query.status;
    if (req.query.department) query.department = req.query.department;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const io = req.app.get('io');
    if (io) io.emit('user_approved', { userId: user._id, name: user.name, role: user.role });

    res.json({ success: true, data: user, message: `${user.name} approved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'department', 'specialization', 'status', 'role', 'licenseNumber'];
    const updates = {};
    allowedUpdates.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, pendingUsers, totalNurses] = await Promise.all([
      User.countDocuments({ role: 'patient', status: 'approved' }),
      User.countDocuments({ role: 'doctor', status: 'approved' }),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'nurse', status: 'approved' })
    ]);

    res.json({
      success: true,
      data: { totalPatients, totalDoctors, pendingUsers, totalNurses }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// const Salary = require('../models/Salary');
// const User = require('../models/User');

// // Default base salaries by role
// const BASE_SALARY = { admin:80000, doctor:120000, nurse:45000, pharmacist:50000, wardboy:25000, sweeper:20000, otboy:28000 };
// const ALLOWANCE_PCT = { hra:0.4, da:0.12, ta:0.05, medical:0.03, special:0.05 }; // % of basic
// const DEDUCTION_PCT = { pf:0.12, esi:0.0175, tax:0.1 }; // % of gross

// function calcSalary(basic, daysWorked=26, overtimeHours=0, daysAbsent=0, extra={}) {
//   const hra     = Math.round(basic * ALLOWANCE_PCT.hra);
//   const da      = Math.round(basic * ALLOWANCE_PCT.da);
//   const ta      = Math.round(basic * ALLOWANCE_PCT.ta);
//   const medical = Math.round(basic * ALLOWANCE_PCT.medical);
//   const special = Math.round(basic * ALLOWANCE_PCT.special);
//   const overtimePay = Math.round((basic / 26 / 8) * 1.5 * overtimeHours);
//   const gross   = basic + hra + da + ta + medical + special + overtimePay + (extra.bonus||0);
//   const pf      = Math.round(basic * DEDUCTION_PCT.pf);
//   const esi     = Math.round(gross * DEDUCTION_PCT.esi);
//   const tax     = Math.round(gross * DEDUCTION_PCT.tax);
//   const absent  = daysAbsent > 0 ? Math.round((basic/26)*daysAbsent) : 0;
//   const totalDed = pf + esi + tax + absent + (extra.loan||0) + (extra.otherDed||0);
//   const net     = gross - totalDed;
//   return { hra,da,ta,medical,special,overtimePay, gross, pf,esi,tax,absent, totalDed, net };
// }

// // GET all salaries (admin) or own (staff)
// exports.getSalaries = async (req, res) => {
//   try {
//     const q = {};
//     if (req.user.role !== 'admin') q.employee = req.user.id;
//     if (req.query.employeeId) q.employee = req.query.employeeId;
//     if (req.query.month) q.month = parseInt(req.query.month);
//     if (req.query.year)  q.year  = parseInt(req.query.year);
//     if (req.query.status) q.status = req.query.status;
//     const salaries = await Salary.find(q)
//       .populate('employee','name role department email phone')
//       .populate('creditedBy','name')
//       .sort({ year:-1, month:-1 });
//     res.json({ success:true, count:salaries.length, data:salaries });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };

// // GET salary summary for dashboard
// exports.getMySalarySummary = async (req, res) => {
//   try {
//     const salaries = await Salary.find({ employee: req.user.id }).sort({ year:-1, month:-1 }).limit(12);
//     const latest = salaries[0];
//     res.json({ success:true, data:{ latest, history:salaries } });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };

// // POST generate salary for employee(s)
// exports.generateSalary = async (req, res) => {
//   try {
//     const { employeeId, month, year, daysWorked=26, daysAbsent=0, overtimeHours=0, bonus=0, loan=0, otherDed=0, remarks='', paymentMode='bank_transfer', bankAccount='' } = req.body;
//     const emp = await User.findById(employeeId);
//     if (!emp) return res.status(404).json({ success:false, error:'Employee not found' });
//     const basic = BASE_SALARY[emp.role] || 30000;
//     const calc  = calcSalary(basic, daysWorked, overtimeHours, daysAbsent, { bonus, loan, otherDed });
//     const salary = await Salary.findOneAndUpdate(
//       { employee:employeeId, month, year },
//       {
//         employee:employeeId, month, year,
//         basicPay: basic, daysWorked, daysAbsent, overtimeHours, overtimePay:calc.overtimePay,
//         allowances:{ hra:calc.hra, da:calc.da, ta:calc.ta, medical:calc.medical, special:calc.special },
//         deductions:{ pf:calc.pf, esi:calc.esi, tax:calc.tax, absent:calc.absent, loan, other:otherDed },
//         grossPay:calc.gross, netPay:calc.net, remarks, paymentMode, bankAccount, status:'pending'
//       },
//       { upsert:true, new:true, runValidators:true }
//     );
//     await salary.populate('employee','name role department');
//     res.status(201).json({ success:true, data:salary });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };

// // POST bulk generate for all staff
// exports.bulkGenerateSalary = async (req, res) => {
//   try {
//     const { month, year } = req.body;
//     const staff = await User.find({ status:'approved', role:{ $in:['admin','doctor','nurse','pharmacist','wardboy','sweeper','otboy'] } });
//     const results = [];
//     for (const emp of staff) {
//       const basic = BASE_SALARY[emp.role] || 30000;
//       const calc  = calcSalary(basic);
//       const salary = await Salary.findOneAndUpdate(
//         { employee:emp._id, month, year },
//         { employee:emp._id, month, year, basicPay:basic, daysWorked:26, daysAbsent:0, overtimeHours:0, overtimePay:0,
//           allowances:{ hra:calc.hra, da:calc.da, ta:calc.ta, medical:calc.medical, special:calc.special },
//           deductions:{ pf:calc.pf, esi:calc.esi, tax:calc.tax, absent:0, loan:0, other:0 },
//           grossPay:calc.gross, netPay:calc.net, status:'pending' },
//         { upsert:true, new:true, runValidators:false }
//       );
//       results.push(salary);
//     }
//     res.json({ success:true, count:results.length, data:results });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };

// // PUT credit salary (mark as paid)
// exports.creditSalary = async (req, res) => {
//   try {
//     const salary = await Salary.findByIdAndUpdate(req.params.id,
//       { status:'credited', creditedAt:new Date(), creditedBy:req.user.id },
//       { new:true }
//     ).populate('employee','name role email');
//     if (!salary) return res.status(404).json({ success:false, error:'Salary record not found' });
//     const io = req.app.get('io');
//     if (io) {
//       io.to(`user_${salary.employee._id}`).emit('salary_credited', {
//         month:salary.month, year:salary.year, netPay:salary.netPay, grossPay:salary.grossPay,
//         employeeName:salary.employee.name
//       });
//     }
//     res.json({ success:true, data:salary });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };

// exports.getDashboardStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalDoctors = await User.countDocuments({ role: 'doctor' });
//     const totalPatients = await User.countDocuments({ role: 'patient' });

//     res.json({
//       success: true,
//       data: {
//         totalUsers,
//         totalDoctors,
//         totalPatients
//       }
//     });
//   } catch (e) {
//     res.status(500).json({ success: false, error: e.message });
//   }
// };
// // PUT update salary details
// exports.updateSalary = async (req, res) => {
//   try {
//     const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new:true }).populate('employee','name role');
//     if (!salary) return res.status(404).json({ success:false, error:'Not found' });
//     res.json({ success:true, data:salary });
//   } catch(e) { res.status(500).json({ success:false, error:e.message }); }
// };
