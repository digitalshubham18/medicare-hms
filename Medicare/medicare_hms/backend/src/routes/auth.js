const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  initiateRegister, verifyRegister,
  initiateLogin, verifyLogin,
  resendOtp, forgotPassword, resetPassword,
  getMe, updateProfile, logout, changePassword,
} = require('../controllers/authController');

const emailRule    = body('email').isEmail().withMessage('Valid email required');
const passwordRule = body('password').isLength({ min: 6 }).withMessage('Password min 6 chars');
const nameRule     = body('name').trim().notEmpty().withMessage('Name required');

router.post('/register/initiate', [nameRule, emailRule, passwordRule], initiateRegister);
router.post('/register/verify',   [emailRule, body('otp').notEmpty()], verifyRegister);
router.post('/login/initiate',    [emailRule, passwordRule], initiateLogin);
router.post('/login/verify',      [emailRule, body('otp').notEmpty()], verifyLogin);

// Legacy aliases (redirect to OTP flow)
router.post('/register', [nameRule, emailRule, passwordRule], initiateRegister);
router.post('/login',    [emailRule, passwordRule], initiateLogin);

router.post('/resend-otp',      resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

router.get('/me',              protect, getMe);
router.put('/profile',         protect, updateProfile);
router.post('/logout',         protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;
