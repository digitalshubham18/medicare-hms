const User   = require('../models/User');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { sendOtpEmail } = require('../utils/emailService');

const genOtp  = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// POST /api/auth/register/initiate
exports.initiateRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, email, password, role, phone, department } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.emailVerified) return res.status(400).json({ success: false, error: 'Email already registered' });
    const otp = genOtp();
    const expire = new Date(Date.now() + 10 * 60 * 1000);
    if (existing) {
      existing.emailOtp = hashOtp(otp); existing.emailOtpExpire = expire; existing.emailOtpPurpose = 'register';
      await existing.save({ validateBeforeSave: false });
    } else {
      await User.create({ name, email: email.toLowerCase(), password, role: role || 'patient', phone: phone||'', department: department||'', status:'pending', emailVerified:false, emailOtp:hashOtp(otp), emailOtpExpire:expire, emailOtpPurpose:'register' });
    }
    const result = await sendOtpEmail({ to: email, name, otp, purpose: 'register' });
    res.json({ success: true, message: `OTP sent to ${email}`, devOtp: result.devMode ? otp : undefined });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// POST /api/auth/register/verify
exports.verifyRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), emailOtp: hashOtp(otp), emailOtpExpire: { $gt: new Date() }, emailOtpPurpose: 'register' }).select('+emailOtp +emailOtpExpire +emailOtpPurpose');
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    user.emailVerified = true; user.emailOtp = undefined; user.emailOtpExpire = undefined; user.emailOtpPurpose = undefined;
    await user.save({ validateBeforeSave: false });
    const io = req.app.get('io');
    if (io) io.emit('new_user_registration', { userId: user._id, name: user.name, role: user.role });
    res.status(201).json({ success: true, message: 'Email verified! Awaiting admin approval.' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// POST /api/auth/login/initiate
exports.initiateLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    if (!user.emailVerified) return res.status(403).json({ success: false, error: 'Email not verified. Please complete registration first.' });
    if (user.status === 'pending')   return res.status(403).json({ success: false, error: 'Account pending admin approval' });
    if (user.status === 'suspended') return res.status(403).json({ success: false, error: 'Account suspended. Contact administrator.' });
    const otp = genOtp();
    user.emailOtp = hashOtp(otp); user.emailOtpExpire = new Date(Date.now() + 10 * 60 * 1000); user.emailOtpPurpose = 'login';
    await user.save({ validateBeforeSave: false });
    const result = await sendOtpEmail({ to: user.email, name: user.name, otp, purpose: 'login' });
    res.json({ success: true, message: `OTP sent to ${user.email}`, devOtp: result.devMode ? otp : undefined });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// POST /api/auth/login/verify
exports.verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), emailOtp: hashOtp(otp), emailOtpExpire: { $gt: new Date() }, emailOtpPurpose: 'login' }).select('+emailOtp +emailOtpExpire +emailOtpPurpose');
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    user.emailOtp = undefined; user.emailOtpExpire = undefined; user.emailOtpPurpose = undefined;
    user.isOnline = true; user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
    const token = user.getSignedJwtToken();
    res.json({ success: true, token, data: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, department: user.department, avatar: user.avatar, phone: user.phone, age: user.age, bloodGroup: user.bloodGroup, specialization: user.specialization } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+emailOtp +emailOtpExpire +emailOtpPurpose');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const otp = genOtp();
    user.emailOtp = hashOtp(otp); user.emailOtpExpire = new Date(Date.now() + 10 * 60 * 1000); user.emailOtpPurpose = purpose || 'login';
    await user.save({ validateBeforeSave: false });
    const result = await sendOtpEmail({ to: user.email, name: user.name, otp, purpose: user.emailOtpPurpose });
    res.json({ success: true, message: `New OTP sent`, devOtp: result.devMode ? otp : undefined });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: 'No account found' });
    const otp = genOtp();
    user.resetPasswordToken = hashOtp(otp); user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const result = await sendOtpEmail({ to: email, name: user.name, otp, purpose: 'register' });
    res.json({ success: true, message: `OTP sent to ${email}`, devOtp: result.devMode ? otp : undefined });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, error: 'Password min 6 characters' });
    const user = await User.findOne({ email: email?.toLowerCase(), resetPasswordToken: hashOtp(otp), resetPasswordExpire: { $gt: new Date() } }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    user.password = newPassword; user.resetPasswordToken = undefined; user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.getMe = async (req, res) => {
  try { const user = await User.findById(req.user.id); res.json({ success: true, data: user }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name','phone','address','age','bloodGroup','weight','height','emergencyContact','notificationPrefs'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.logout = async (req, res) => {
  try { await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastSeen: new Date() }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ success: false, error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// Legacy compat aliases
exports.login    = exports.initiateLogin;
exports.register = exports.initiateRegister;
