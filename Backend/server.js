import dotenv from "dotenv";
import vestauth from "vestauth";
import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import dns from "node:dns/promises";
import cookieParser from 'cookie-parser';
import { createServer } from "http";
import connectDB from "./config/db.js";
import validateEnv from "./config/env.js";
import authRouter from "./routes/auth.js";
import expenseRouter from "./routes/expenses.js";
import insightRouter from "./routes/insights.js";
import contactRouter from "./routes/contact.js"
import errorHandler from "./middleware/errorHandler.js";

dns.setServers(["1.1.1.1"]);

dotenv.config();
validateEnv();
connectDB();

if (process.env.VESTAUTH_INIT === 'true') {
  (async () => {
    try {
      const info = await vestauth.tool.init(process.env.TOOL_HOSTNAME || null);
      console.log('vestauth: tool init succeeded', info);
    } catch (err) {
      console.error('vestauth: tool init failed', err?.message || err);
    }
  })();
}

const app = express();
const server = createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
    data: { version: "v1.0" }
  });
});

app.use("/api/auth", authRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/insights", insightRouter);
app.use("/api/contact", contactRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${process.env.CLIENT_URL || 'http://localhost'}:${PORT}`);
});
