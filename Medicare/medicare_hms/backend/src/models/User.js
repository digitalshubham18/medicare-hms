// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     maxlength: [100, 'Name cannot exceed 100 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters'],
//     select: false
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'doctor', 'patient', 'nurse', 'pharmacist', 'wardboy'],
//     default: 'patient'
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'suspended'],
//     default: 'pending'
//   },
//   avatar: { type: String, default: '' },
//   phone: { type: String, default: '' },
//   department: { type: String, default: '' },
//   specialization: { type: String, default: '' },
//   licenseNumber: { type: String, default: '' },
//   age: { type: Number },
//   bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] , default: '' },
//   weight: { type: Number },
//   height: { type: Number },
//   address: { type: String, default: '' },
//   emergencyContact: {
//     name: { type: String, default: '' },
//     phone: { type: String, default: '' },
//     relation: { type: String, default: '' }
//   },
//   rating: { type: Number, default: 4.5, min: 1, max: 5 },
//   totalPatients: { type: Number, default: 0 },
//   isOnline: { type: Boolean, default: false },
//   lastSeen: { type: Date },
  // emailVerified: { type: Boolean, default: false },
  // emailOtp: { type: String, select: false },
  // emailOtpExpire: { type: Date, select: false },
  // emailOtpPurpose: { type: String, enum: ['register','login'], select: false },
  // resetPasswordToken: { type: String, select: false },
  // resetPasswordExpire: { type: Date, select: false },
//   notificationPrefs: {
//     email: { type: Boolean, default: true },
//     sms: { type: Boolean, default: false },
//     push: { type: Boolean, default: true }
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Match password
// UserSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Generate JWT
// UserSchema.methods.getSignedJwtToken = function() {
//   return jwt.sign(
//     { id: this._id, role: this.role },
//     process.env.JWT_SECRET,
//     // { expiresIn: process.env.JWT_EXPIRE }
//     { expiresIn: process.env.JWT_EXPIRE || "100d" }
//   );
// };

// // Get initials for avatar
// UserSchema.virtual('initials').get(function() {
//   return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient', 'nurse', 'pharmacist', 'wardboy', 'sweeper', 'otboy', 'finance', 'electrician', 'plumber', 'it_technician', 'equipment_tech', 'biomedical', 'security', 'receptionist', 'ambulance_driver'],
    default: 'patient'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended'],
    default: 'pending'
  },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  specialization: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  age: { type: Number },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-',''] , default: '' },
  weight: { type: Number },
  height: { type: Number },
  address: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  totalPatients: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  emailVerified: { type: Boolean, default: false },
  emailOtp: { type: String, select: false },
  emailOtpExpire: { type: Date, select: false },
  emailOtpPurpose: { type: String, enum: ['register','login'], select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  resetPasswordToken:  { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  notificationPrefs: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Get initials for avatar
UserSchema.virtual('initials').get(function() {
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

module.exports = mongoose.model('User', UserSchema);