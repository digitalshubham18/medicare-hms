const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['appointment', 'order'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // appointment or order _id
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  gatewayResponse: { type: Object },
  cardLast4: { type: String },
  cardBrand: { type: String },
  description: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
