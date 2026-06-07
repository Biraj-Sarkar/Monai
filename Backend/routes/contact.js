import express from "express";
import Subscribe from "../models/Subscribe.js";
import { getMailFrom, sendEmail } from "../services/emailService.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const buildWelcomeEmail = ({ email, unsubscribeUrl }) => ({
  from: getMailFrom(),
  to: email,
  subject: 'Welcome to Expense Tracker updates',
  text: [
    'Thanks for subscribing to Expense Tracker updates.',
    'You will receive product news, feature launches, and helpful money-management tips.',
    `If you want to unsubscribe later, use this link: ${unsubscribeUrl}`,
  ].join('\n\n'),
  html: `
    <div style="margin:0;padding:0;background:#f4f2ec;font-family:Inter,Segoe UI,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:linear-gradient(135deg,#111827 0%,#1f1140 55%,#0f172a 100%);border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.18);">
          <div style="padding:32px 28px 24px;color:#f8fafc;">
            <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(139,92,246,0.16);color:#c4b5fd;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
              Expense Tracker
            </div>

            <h1 style="margin:18px 0 12px;font-size:28px;line-height:1.15;color:#ffffff;">You’re in. Welcome aboard.</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#cbd5e1;">
              Thanks for subscribing, <strong style="color:#ffffff;">${email}</strong>. You’ll now get product updates, release notes, and practical tips to manage spending better.
            </p>

            <div style="margin:24px 0;padding:18px 18px;border-radius:18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#e2e8f0;">What to expect:</p>
              <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:14px;line-height:1.8;">
                <li>Feature announcements and improvements</li>
                <li>Expense tracking tips and reminders</li>
                <li>Budgeting and insight highlights</li>
              </ul>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
              <a href="${unsubscribeUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;box-shadow:0 10px 24px rgba(59,130,246,0.28);">
                Unsubscribe
              </a>
              <span style="font-size:13px;color:#94a3b8;">If this wasn’t you, you can safely ignore this email.</span>
            </div>
          </div>

          <div style="padding:18px 28px 28px;color:#94a3b8;font-size:12px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);">
            © 2026 Expense Tracker. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  `,
});

const buildUnsubscribedResponse = (email) => `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f2ec;font-family:Inter,Segoe UI,Arial,sans-serif;padding:24px;">
    <div style="max-width:560px;width:100%;background:#111827;color:#e5e7eb;border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(15,23,42,0.16);text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:999px;background:rgba(59,130,246,0.12);color:#60a5fa;font-size:26px;margin-bottom:16px;">✓</div>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#ffffff;">You’re unsubscribed</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#cbd5e1;">
        <strong style="color:#ffffff;">${email}</strong> will no longer receive email updates from Expense Tracker.
      </p>
      <a href="/" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Back to Home</a>
    </div>
  </div>
`;

router.post('/', asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: getMailFrom(),
    to: process.env.EMAIL,
    replyTo: email,
    subject: subject || `New Contact Form Submission from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n')
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}));

router.post('/subscribe', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailExists = await Subscribe.findOne({ email: normalizedEmail });

  if (emailExists) {
    return res.status(409).json({ success: false, message: 'This email is already subscribed to our updates.' });
  }

  const subscribe = await Subscribe.create({ email: normalizedEmail });
  const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const unsubscribeUrl = `${backendBaseUrl.replace(/\/$/, '')}/api/contact/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`;

  await sendEmail(buildWelcomeEmail({ email: normalizedEmail, unsubscribeUrl }));

  return res.status(201).json({
    success: true,
    message: 'Subscribed successfully. A welcome email has been sent.',
    data: {
      user: { id: subscribe._id, email: subscribe.email },
    },
  });
}));

router.get('/unsubscribe', asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const deleted = await Subscribe.findOneAndDelete({ email: normalizedEmail });

  if (!deleted) {
    return res.status(404).send(buildUnsubscribedResponse(normalizedEmail));
  }

  return res.status(200).send(buildUnsubscribedResponse(normalizedEmail));
}));

export default router;
