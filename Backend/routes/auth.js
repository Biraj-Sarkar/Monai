import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import vestAuthMiddleware from "../middleware/vestAuthMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

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
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

  const user = new User({ name, email, password });
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

// Agent-only diagnostic route
router.get('/whoami-agent', vestAuthMiddleware, asyncHandler(async (req, res) => {
  res.json({ agent: req.vestAgent });
}));

export default router;
