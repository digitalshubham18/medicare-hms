const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

exports.sendOtpEmail = async ({ to, name, otp, purpose }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV OTP] To: ${to} | OTP: ${otp} | Purpose: ${purpose}\n`);
    return { success: true, devMode: true };
  }
  const subject = purpose === 'register' ? '✅ MediCare HMS — Verify Your Email' : '🔐 MediCare HMS — Login OTP';
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f1f5fb;padding:20px;border-radius:12px">
    <div style="background:linear-gradient(135deg,#1648c9,#0891b2);padding:24px;border-radius:8px;text-align:center;margin-bottom:20px">
      <h2 style="color:#fff;margin:0">🏥 MediCare HMS</h2>
    </div>
    <p style="color:#374151">Hello <strong>${name}</strong>,</p>
    <p style="color:#374151">${purpose === 'register' ? 'Please verify your email to complete registration.' : 'Use this OTP to complete your login.'}</p>
    <div style="background:#fff;border:2px dashed #c7d7fe;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
      <p style="color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Your OTP</p>
      <div style="font-size:40px;font-weight:900;letter-spacing:8px;color:#1648c9;font-family:monospace">${otp}</div>
      <p style="color:#94a3b8;font-size:12px;margin:8px 0 0">Valid for 10 minutes</p>
    </div>
    <p style="color:#94a3b8;font-size:12px">Do not share this OTP with anyone.</p>
  </div>`;
  const transporter = createTransporter();
  await transporter.sendMail({ from: `"MediCare HMS" <${process.env.EMAIL_USER}>`, to, subject, html });
  return { success: true };
};
