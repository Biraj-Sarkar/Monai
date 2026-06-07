import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import vestAuthMiddleware from "../middleware/vestAuthMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { getMailFrom, sendEmail } from "../services/emailService.js";

const router = express.Router();
const client = new OAuth2Client();
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const getJwtSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !refreshSecret) {
    throw new Error("JWT secrets are missing. Check JWT_SECRET and JWT_REFRESH_SECRET in Backend/.env");
  }

  return { jwtSecret, refreshSecret };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const getGooglePayload = async ({ credential, accessToken }) => {
  if (credential) {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    return ticket.getPayload();
  }

  if (accessToken) {
    const tokenInfo = await client.getTokenInfo(accessToken);
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google token audience mismatch");
    }

    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error("Unable to fetch Google account profile");
    }

    return response.json();
  }

  return null;
};

const sendResetEmail = async (email, url) => {
  const mailOptions = {
    from: getMailFrom(),
    to: email,
    subject: "Reset your Monai password",
    text: `We received a request to reset your Monai password. Open this link to continue: ${url}\n\nThis link expires in 15 minutes. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="margin:0;padding:0;background:#f5f7fb;font-family:Inter,Segoe UI,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#111827 100%);border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 60px rgba(15,23,42,0.18);">
            <div style="padding:34px 30px 28px;">
              <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(59,130,246,0.12);color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
                Monai
              </div>

              <h1 style="margin:18px 0 12px;font-size:30px;line-height:1.15;color:#ffffff;">Reset your password</h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#cbd5e1;">
                We received a request to reset the password for <strong style="color:#ffffff;">${email}</strong>. Click the button below to choose a new password.
              </p>

              <div style="margin:26px 0 22px;text-align:center;">
                <a href="${url}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:linear-gradient(90deg,#2563eb 0%,#7c3aed 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.01em;box-shadow:0 12px 24px rgba(37,99,235,0.28);">
                  Reset password
                </a>
              </div>

              <div style="padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#cbd5e1;">
                  This link will expire in <strong style="color:#ffffff;">15 minutes</strong> for your security.
                </p>
                <p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;word-break:break-all;">
                  If the button does not work, copy and paste this URL into your browser:<br />
                  <span style="color:#bfdbfe;">${url}</span>
                </p>
              </div>

              <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;">
                If you did not request this reset, you can ignore this email safely.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }
  await sendEmail(mailOptions);
};

router.post('/login', authRateLimiter, asyncHandler(async (req, res, next) => {
  const { jwtSecret, refreshSecret } = getJwtSecrets();
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.authProvider !== "local") {
    return res.status(400).json({ success: false, message: 'Please sign in using Google' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id, tokenType: 'refresh' }, refreshSecret, { expiresIn: '30d' });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({ 
    success: true,
    message: "Logged in successfully",
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
}));

router.post('/refresh', asyncHandler(async (req, res, next) => {
  const { jwtSecret, refreshSecret } = getJwtSecrets();
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh token missing" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshSecret);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
  const newRefreshToken = jwt.sign({ userId: user._id, tokenType: 'refresh' }, refreshSecret, { expiresIn: '30d' });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
}));

router.post('/register', authRateLimiter, asyncHandler(async (req, res, next) => {
  const { jwtSecret, refreshSecret } = getJwtSecrets();
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ success: false, message: "User with this email already exists" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" })
  }

  const user = new User({ name, email, password, authProvider: "local", isEmailVerified: false });
  await user.save();

  const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id, tokenType: 'refresh' }, refreshSecret, { expiresIn: '30d' });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({ 
    success: true,
    message: "Account created successfully", 
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
}));

router.post('/google', authRateLimiter, asyncHandler(async (req, res, next) => {
  const { jwtSecret, refreshSecret } = getJwtSecrets();
  const { credential, accessToken } = req.body;

  if (!credential && !accessToken) {
    return res.status(400).json({ success: false, message: "Google credential is required" });
  }

  const payload = await getGooglePayload({ credential, accessToken });

  if (!payload?.email || !payload?.sub) {
    return res.status(401).json({ success: false, message: "Invalid Google account payload" });
  }

  if (!payload.email_verified) {
    return res.status(401).json({ success: false, message: "Google email is not verified" });
  }

  let user = await User.findOne({
    email: payload.email
  });

  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture,
      authProvider: "google",
      isEmailVerified: payload.email_verified
    });
  }
  else if (user.authProvider === "local" && !user.googleId) {
    user.googleId = payload.sub;
    user.avatar = payload.picture;
    user.isEmailVerified = true;

    await user.save();
  } else if (user.googleId && user.googleId !== payload.sub) {
    return res.status(409).json({ success: false, message: "This email is already linked to another Google account" });
  }

  const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id, tokenType: 'refresh' }, refreshSecret, { expiresIn: '30d' });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({ 
    success: true,
    message: "Logged in successfully",
    data: {
      token,
      user: { id: user._id, name: user.name, email: user.email }
    }
  });
}));

router.post('/forget-password', asyncHandler(async(req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(401).json({ success: false, message: "If your email exists in our system, you will receive a reset link" });
  }

  if (user.authProvider === "google" && !user.password) {
    return res.status(400).json({ success: false, message: "This account uses Google Sign-In." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendResetEmail(user.email, resetURL);

  return res.status(200).json({ success: true, message: "If your email exists in our system, you will receive a reset link" });
}))

router.post('/reset-password', asyncHandler(async(req,res)=>{
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return res.status(400).json({ success:false, message:"Reset link expired" });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Missing password' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" })
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.status(200).json({ success: true, message: "Your password has been successfully reset." });
}));

// Agent-only diagnostic route
router.get('/whoami-agent', vestAuthMiddleware, asyncHandler(async (req, res) => {
  res.json({ agent: req.vestAgent });
}));

export default router;
