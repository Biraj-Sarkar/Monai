import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import vestAuthMiddleware from "../middleware/vestAuthMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const client = new OAuth2Client();

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
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: "Google credential is required" });
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

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
}))

// Agent-only diagnostic route
router.get('/whoami-agent', vestAuthMiddleware, asyncHandler(async (req, res) => {
  res.json({ agent: req.vestAgent });
}));

export default router;
