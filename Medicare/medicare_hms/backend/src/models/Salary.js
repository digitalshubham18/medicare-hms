const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  employee:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month:        { type: Number, required: true },   // 1-12
  year:         { type: Number, required: true },
  basicPay:     { type: Number, required: true, default: 0 },
  allowances:   {
    hra:        { type: Number, default: 0 },  // House Rent
    da:         { type: Number, default: 0 },  // Dearness
    ta:         { type: Number, default: 0 },  // Travel
    medical:    { type: Number, default: 0 },
    special:    { type: Number, default: 0 },
  },
  deductions:   {
    pf:         { type: Number, default: 0 },  // Provident Fund
    esi:        { type: Number, default: 0 },  // ESI
    tax:        { type: Number, default: 0 },  // TDS
    absent:     { type: Number, default: 0 },  // Leave without pay
    loan:       { type: Number, default: 0 },
    other:      { type: Number, default: 0 },
  },
  grossPay:     { type: Number, default: 0 },
  netPay:       { type: Number, default: 0 },
  status:       { type: String, enum: ['pending','credited','held'], default: 'pending' },
  creditedAt:   { type: Date },
  creditedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentMode:  { type: String, enum: ['bank_transfer','cheque','cash'], default: 'bank_transfer' },
  bankAccount:  { type: String, default: '' },
  remarks:      { type: String, default: '' },
  daysWorked:   { type: Number, default: 26 },
  daysAbsent:   { type: Number, default: 0 },
  overtimeHours:{ type: Number, default: 0 },
  overtimePay:  { type: Number, default: 0 },
}, { timestamps: true });

// Ensure one salary record per employee per month/year
SalarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', SalarySchema);


