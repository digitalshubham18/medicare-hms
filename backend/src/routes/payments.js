const express = require('express');
const router = express.Router();
const { initiatePayment, confirmPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/initiate', initiatePayment);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
