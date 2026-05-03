const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const crypto = require('crypto');

// Simulate card validation (real system would use Stripe/Razorpay SDK)
function validateCard(card) {
  const num = card.number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(num)) return 'Invalid card number';
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Invalid expiry (MM/YY)';
  const [mm, yy] = card.expiry.split('/').map(Number);
  const now = new Date();
  if (mm < 1 || mm > 12) return 'Invalid expiry month';
  const expDate = new Date(2000 + yy, mm - 1, 1);
  if (expDate < now) return 'Card expired';
  if (!/^\d{3,4}$/.test(card.cvv)) return 'Invalid CVV';
  if (!card.name || card.name.trim().length < 3) return 'Invalid cardholder name';
  return null;
}

function detectBrand(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  if (/^35/.test(n)) return 'JCB';
  return 'Card';
}

function generateTxnId() {
  return 'TXN' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// POST /api/payments/initiate
exports.initiatePayment = async (req, res) => {
  try {
    const { type, refId } = req.body;
    let amount = 0;
    let description = '';

    if (type === 'appointment') {
      const appt = await Appointment.findById(refId).populate('doctor', 'name specialization fee');
      if (!appt) return res.status(404).json({ success: false, error: 'Appointment not found' });
      if (appt.paymentStatus === 'paid') return res.status(400).json({ success: false, error: 'Already paid' });
      amount = appt.fee || 500;
      description = `Consultation with Dr. ${appt.doctor?.name || 'Doctor'}`;
    } else if (type === 'order') {
      const order = await Order.findById(refId);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, error: 'Already paid' });
      amount = order.totalAmount;
      description = `Medicine Order #${order.orderNumber}`;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment type' });
    }

    const payment = await Payment.create({
      user: req.user.id,
      type,
      refId,
      amount,
      description,
      status: 'pending',
    });

    res.json({ success: true, data: { paymentId: payment._id, amount, description } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/payments/confirm
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, method, card, upi } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
    if (payment.status === 'success') return res.status(400).json({ success: false, error: 'Already paid' });
    if (payment.user.toString() !== req.user.id) return res.status(403).json({ success: false, error: 'Not authorized' });

    let cardBrand = '', cardLast4 = '';

    if (method === 'card') {
      const err = validateCard(card);
      if (err) return res.status(400).json({ success: false, error: err });
      cardBrand = detectBrand(card.number);
      cardLast4 = card.number.replace(/\s/g, '').slice(-4);
    } else if (method === 'upi') {
      if (!upi || !upi.trim()) return res.status(400).json({ success: false, error: 'UPI ID required' });
      if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim())) return res.status(400).json({ success: false, error: 'Invalid UPI ID format' });
    }

    // Simulate 97% success rate (decline test card 4000000000000002)
    const testNum = card?.number?.replace(/\s/g, '');
    const shouldFail = testNum === '4000000000000002';
    if (shouldFail) {
      payment.status = 'failed';
      await payment.save();
      return res.status(402).json({ success: false, error: 'Payment declined by bank. Please try a different card.' });
    }

    const txnId = generateTxnId();
    payment.status = 'success';
    payment.method = method;
    payment.transactionId = txnId;
    payment.cardBrand = cardBrand;
    payment.cardLast4 = cardLast4;
    payment.paidAt = new Date();
    payment.gatewayResponse = { simulated: true, timestamp: new Date(), amount: payment.amount };
    await payment.save();

    // Update the linked record
    if (payment.type === 'appointment') {
      await Appointment.findByIdAndUpdate(payment.refId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        fee: payment.amount,
      });
    } else if (payment.type === 'order') {
      await Order.findByIdAndUpdate(payment.refId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentMethod: method === 'card' ? 'card' : 'online',
      });
    }

    res.json({
      success: true,
      data: {
        transactionId: txnId,
        amount: payment.amount,
        description: payment.description,
        method,
        cardBrand,
        cardLast4,
        paidAt: payment.paidAt,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/payments/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    const payments = await Payment.find(query).populate('user', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
